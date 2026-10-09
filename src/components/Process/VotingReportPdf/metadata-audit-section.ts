import {
  type AuditedMetadataVersion,
  type DiffSegment,
  type ElectionMetadataAudit,
  type MetadataChange,
  type ProcessMetadataAudit,
  condenseDiff,
  diffWords,
  hasIntegrityIssues,
  hasMetadataUpdates,
  normalizeHex,
} from '@vocdoni/metadata-verify'
import { type TFunction } from 'i18next'

/** Shape shared with `CertificateField` in certificate-data, kept local to avoid an import cycle. */
type AuditField = { label: string; value: string; helperText?: string }

export type CertificateMetadataChange =
  | { kind: 'inline'; label: string; segments: DiffSegment[] }
  | { kind: 'replace'; label: string; detail?: string; before: string; after: string }
  | { kind: 'note'; label: string; text: string }

export type CertificateMetadataVersion = {
  heading: string
  fields: AuditField[]
  changes: CertificateMetadataChange[]
  note?: string
}

export type CertificateMetadataElection = {
  title: string
  summary: string
  warnings?: string[]
  note?: string
  fields?: AuditField[]
  versions: CertificateMetadataVersion[]
}

export type CertificateMetadataAudit = {
  intro: string
  summary: string
  integrityWarning?: string
  linkWarning?: string
  legend?: string
  elections: CertificateMetadataElection[]
}

/** The process or one of its questions, with the on-chain election that carries its metadata. */
export type AuditedQuestion = { title: string; upstreamId?: string }

const TEXT_FIELDS = new Set<MetadataChange['field']>([
  'title',
  'description',
  'questionTitle',
  'questionDescription',
  'choiceTitle',
  'choiceDescription',
])

const formatTimestamp = (date: Date | null) =>
  date ? `${date.toISOString().slice(0, 19).replace('T', ' ')} UTC` : null

const getIntegrityText = (version: AuditedMetadataVersion, t: TFunction) => {
  switch (version.status) {
    case 'verified':
      return t('process_pdf.metadata_audit.integrity.verified', {
        defaultValue: 'Verified: the document matches the hash recorded on chain',
      })
    case 'mismatch':
      return t('process_pdf.metadata_audit.integrity.mismatch', {
        defaultValue: 'Mismatch: the document available now does not match the hash recorded on chain',
      })
    case 'no-hash':
      return t('process_pdf.metadata_audit.integrity.unrecorded', {
        defaultValue: 'Not verifiable: no hash was recorded on chain for this version',
      })
    default:
      return t('process_pdf.metadata_audit.integrity.unreachable', {
        defaultValue: 'Unavailable: the document could not be retrieved',
      })
  }
}

const getChangeLabel = (change: MetadataChange, singleQuestion: boolean, t: TFunction) => {
  const question = (change.question ?? 0) + 1
  const choice = (change.choice ?? 0) + 1
  let label: string
  switch (change.field) {
    case 'title':
      label = t('process_pdf.metadata_audit.field.title', { defaultValue: 'Title' })
      break
    case 'description':
      label = t('process_pdf.metadata_audit.field.description', { defaultValue: 'Description' })
      break
    case 'header':
      label = t('process_pdf.metadata_audit.field.header', { defaultValue: 'Header image' })
      break
    case 'streamUri':
      label = t('process_pdf.metadata_audit.field.stream_uri', { defaultValue: 'Video' })
      break
    case 'headerContent':
      label = t('process_pdf.metadata_audit.field.header_content', { defaultValue: 'Header image content changed' })
      break
    case 'mediaHash':
      label = t('process_pdf.metadata_audit.field.media_hash', { defaultValue: 'Media file hash' })
      break
    case 'questionTitle':
      label = singleQuestion
        ? t('process_pdf.metadata_audit.field.question_title', { defaultValue: 'Question' })
        : t('process_pdf.metadata_audit.field.question_n_title', {
            defaultValue: 'Question {{question}}',
            question,
          })
      break
    case 'questionDescription':
      label = singleQuestion
        ? t('process_pdf.metadata_audit.field.question_description', { defaultValue: 'Question description' })
        : t('process_pdf.metadata_audit.field.question_n_description', {
            defaultValue: 'Question {{question}} description',
            question,
          })
      break
    case 'choiceTitle':
      label = singleQuestion
        ? t('process_pdf.metadata_audit.field.choice_title', { defaultValue: 'Option {{choice}}', choice })
        : t('process_pdf.metadata_audit.field.question_n_choice_title', {
            defaultValue: 'Question {{question}}, option {{choice}}',
            question,
            choice,
          })
      break
    case 'choiceDescription':
      label = singleQuestion
        ? t('process_pdf.metadata_audit.field.choice_description', {
            defaultValue: 'Option {{choice}} description',
            choice,
          })
        : t('process_pdf.metadata_audit.field.question_n_choice_description', {
            defaultValue: 'Question {{question}}, option {{choice}} description',
            question,
            choice,
          })
      break
    case 'choiceImage':
      if (change.variant === 'thumbnail') {
        label = singleQuestion
          ? t('process_pdf.metadata_audit.field.choice_thumbnail', {
              defaultValue: 'Option {{choice}} thumbnail',
              choice,
            })
          : t('process_pdf.metadata_audit.field.question_n_choice_thumbnail', {
              defaultValue: 'Question {{question}}, option {{choice}} thumbnail',
              question,
              choice,
            })
        break
      }
      label = singleQuestion
        ? t('process_pdf.metadata_audit.field.choice_image', { defaultValue: 'Option {{choice}} image', choice })
        : t('process_pdf.metadata_audit.field.question_n_choice_image', {
            defaultValue: 'Question {{question}}, option {{choice}} image',
            question,
            choice,
          })
      // Variant names other than the two known ones are data, shown as stored in the document.
      if (change.variant && change.variant !== 'default') label = `${label} (${change.variant})`
      break
    case 'choiceImageContent':
      label = singleQuestion
        ? t('process_pdf.metadata_audit.field.choice_image_content', {
            defaultValue: 'Option {{choice}} image content changed',
            choice,
          })
        : t('process_pdf.metadata_audit.field.question_n_choice_image_content', {
            defaultValue: 'Question {{question}}, option {{choice}} image content changed',
            question,
            choice,
          })
      break
    default:
      label = t('process_pdf.metadata_audit.field.other', { defaultValue: 'Other settings' })
  }
  // Language codes are data, not copy: they are shown as stored in the document.
  return change.lang && change.lang !== 'default' ? `${label} (${change.lang})` : label
}

const buildChange = (change: MetadataChange, singleQuestion: boolean, t: TFunction): CertificateMetadataChange => {
  const label = getChangeLabel(change, singleQuestion, t)
  if (change.field === 'other') {
    return {
      kind: 'note',
      label,
      text: t('process_pdf.metadata_audit.other_changed', {
        defaultValue: 'Other parts of the document that are not listed above changed.',
      }),
    }
  }
  if (TEXT_FIELDS.has(change.field) && change.before !== null && change.after !== null) {
    return {
      kind: 'inline',
      label,
      segments: condenseDiff(diffWords(change.before, change.after)),
    }
  }
  const empty = t('process_pdf.metadata_audit.empty', { defaultValue: '(none)' })
  return {
    kind: 'replace',
    label,
    // The video is covered only by its URL, never by its content, so its rows say so.
    detail:
      change.field === 'streamUri'
        ? t('process_pdf.metadata_audit.video_url_only', {
            defaultValue: 'Only the video URL is tracked: changes to the video content itself are not covered.',
          })
        : change.mediaUrl,
    before: change.before ?? empty,
    after: change.after ?? empty,
  }
}

const buildVersion = (
  version: AuditedMetadataVersion,
  index: number,
  t: TFunction,
  notAvailableLabel: string
): CertificateMetadataVersion => {
  const changes = version.changes ?? []
  const singleQuestion = changes.every((change) => (change.question ?? 0) === 0)

  return {
    heading:
      index === 0
        ? t('process_pdf.metadata_audit.version_original', { defaultValue: 'Original version' })
        : t('process_pdf.metadata_audit.version_change', { defaultValue: 'Change {{number}}', number: index }),
    fields: [
      {
        label: t('process_pdf.metadata_audit.date', { defaultValue: 'Date' }),
        value: formatTimestamp(version.timestamp) ?? notAvailableLabel,
      },
      {
        label: t('process_pdf.metadata_audit.block', { defaultValue: 'Block' }),
        value: version.blockHeight > 0 ? String(version.blockHeight) : notAvailableLabel,
      },
      {
        label: t('process_pdf.metadata_audit.transaction', { defaultValue: 'Transaction' }),
        value: version.txHash || notAvailableLabel,
      },
      {
        label: t('process_pdf.metadata_audit.recorded_hash', { defaultValue: 'Recorded hash (SHA-256)' }),
        value: version.expectedHash || notAvailableLabel,
      },
      {
        label: t('process_pdf.metadata_audit.integrity.label', { defaultValue: 'Integrity' }),
        value: getIntegrityText(version, t),
        helperText:
          version.status === 'mismatch'
            ? t('process_pdf.metadata_audit.integrity.computed_hash', {
                defaultValue: 'Hash of the document available now: {{hash}}',
                hash: version.actualHash,
              })
            : undefined,
      },
    ],
    changes: changes.map((change) => buildChange(change, singleQuestion, t)),
    note:
      index === 0
        ? undefined
        : version.changes === null
          ? t('process_pdf.metadata_audit.cannot_compare', {
              defaultValue:
                'The changes cannot be shown because this version or the previous one could not be retrieved or verified.',
            })
          : version.changes.length === 0
            ? t('process_pdf.metadata_audit.no_content_change', {
                defaultValue: 'The content shown to voters did not change.',
              })
            : undefined,
  }
}

/**
 * The "Metadata changes" section. It starts with the voting process itself, whose title,
 * description and media live in the metadata of its parent on-chain election (a metadata-only
 * election). The question entries that follow are the parent's children as linked on chain, with
 * any question of the process that is not among them appended (the order `auditProcessMetadata`
 * returns them in); a question that is not a child, a child that is not a question, or a child
 * declaring another parent is flagged. Each entry lists the metadata versions of its election with
 * their integrity check and the differences against the previous version. A process published
 * without a parent election has no process-level history on chain, which its entry says. `audit`
 * is undefined when the history was not read at all.
 */
export const buildMetadataAuditSection = ({
  process,
  questions,
  audit,
  t,
  notAvailableLabel,
}: {
  process: AuditedQuestion
  questions: AuditedQuestion[]
  audit?: ProcessMetadataAudit | null
  t: TFunction
  notAvailableLabel: string
}): CertificateMetadataAudit => {
  const processId = audit ? (audit.parentElectionId ?? undefined) : normalizeHex(process.upstreamId)
  const processAudit = audit?.process ?? undefined
  const questionIds = questions.map((question) => normalizeHex(question.upstreamId))
  const questionsById = new Map(
    questions
      .map((question, index) => [questionIds[index], { question, index }] as const)
      .filter((entry): entry is readonly [string, { question: AuditedQuestion; index: number }] => !!entry[0])
  )
  // The question elections, each with its audit when the history was read.
  const entries: Array<{ id: string; audit?: ElectionMetadataAudit }> = audit
    ? audit.questions.map((question) => ({ id: question.electionId, audit: question }))
    : [...new Set(questionIds)].filter((id): id is string => !!id && id !== processId).map((id) => ({ id }))
  const linked = processId && audit?.childrenAvailable ? audit.questions.filter((question) => question.child) : null
  const childIds = linked?.map((child) => child.electionId) ?? []

  // The chain links every question election to its parent; the links must match the questions.
  const linkWarnings: string[] = []
  if (processId && !linked) {
    linkWarnings.push(
      t('process_pdf.metadata_audit.children_unavailable', {
        defaultValue: 'The elections linked on chain to the voting process could not be read.',
      })
    )
  }
  if (linked) {
    questions.forEach((_, index) => {
      const id = questionIds[index]
      if (!id || !childIds.includes(id)) {
        linkWarnings.push(
          t('process_pdf.metadata_audit.question_not_child', {
            defaultValue: 'Question {{number}} is not linked on chain to the voting process.',
            number: index + 1,
          })
        )
      }
    })
    for (const child of linked) {
      if (child.issues.includes('wrong-parent')) {
        linkWarnings.push(
          t('process_pdf.metadata_audit.child_parent_mismatch', {
            defaultValue:
              'Election {{id}} is listed among the elections of the voting process but declares another parent: {{parent}}.',
            id: child.electionId,
            parent: child.parentElectionId || notAvailableLabel,
          })
        )
      }
      if (child.issues.includes('not-in-process')) {
        linkWarnings.push(
          t('process_pdf.metadata_audit.child_not_question', {
            defaultValue: 'Election {{id}} is linked on chain to the voting process but is not one of its questions.',
            id: child.electionId,
          })
        )
      }
    }
  }
  const linksMismatch = linked !== null && linkWarnings.length > 0

  // Only elections that exist on chain have a history to read; a missing parent is reported apart.
  const recorded = [...(processId ? [processAudit] : []), ...entries.map((entry) => entry.audit)]
  const readable = recorded.filter((audit): audit is ElectionMetadataAudit => !!audit?.available)
  const anyUnreadable = readable.length < recorded.length
  const anyUpdates = readable.some(hasMetadataUpdates)
  const buildVersions = (audit?: ElectionMetadataAudit) =>
    audit?.available
      ? audit.versions.map((version, versionIndex) => buildVersion(version, versionIndex, t, notAvailableLabel))
      : []
  const getHistorySummary = (audit: ElectionMetadataAudit) =>
    hasMetadataUpdates(audit)
      ? t('process_pdf.metadata_audit.question_changed', {
          defaultValue: 'Changes after creation: {{changes}}.',
          changes: audit.versions.length - 1,
        })
      : t('process_pdf.metadata_audit.question_unchanged', { defaultValue: 'Unchanged since creation.' })

  let summary: string
  if (!readable.length) {
    summary = t('process_pdf.metadata_audit.summary_unavailable', {
      defaultValue: 'The change history of the information shown to voters could not be read.',
    })
  } else if (anyUpdates) {
    summary = t('process_pdf.metadata_audit.summary_changed', {
      defaultValue:
        'The information shown to voters was changed after the voting process was created. Each change is listed below with its date, its blockchain transaction and the exact differences, so that its scope can be assessed.',
    })
  } else if (anyUnreadable) {
    summary = t('process_pdf.metadata_audit.summary_unchanged_partial', {
      defaultValue:
        'No changes were made to the information shown to voters wherever its history could be read. The rest of the history could not be read.',
    })
  } else if (!processId) {
    summary = t('process_pdf.metadata_audit.summary_unchanged_questions', {
      defaultValue:
        'No changes were made to the questions shown to voters after the voting process was created. Changes to the process title, description and media are not recorded on chain for this voting process.',
    })
  } else {
    summary = t('process_pdf.metadata_audit.summary_unchanged', {
      defaultValue: 'No changes were made to the information shown to voters after the voting process was created.',
    })
  }

  const processEntry: CertificateMetadataElection = {
    title: t('process_pdf.metadata_audit.process_heading', {
      defaultValue: 'Voting process: {{title}}',
      title: process.title || notAvailableLabel,
    }),
    summary: !processId
      ? t('process_pdf.metadata_audit.process_not_recorded', {
          defaultValue:
            'Changes to the process title, description and media are not recorded on chain for this voting process, because it was published before they were.',
        })
      : !processAudit?.available
        ? t('process_pdf.metadata_audit.process_history_unavailable', {
            defaultValue: 'The change history of the voting process could not be read.',
          })
        : getHistorySummary(processAudit),
    warnings: linkWarnings.length ? linkWarnings : undefined,
    note: t('process_pdf.metadata_audit.media_note', {
      defaultValue:
        'The header image and option images are covered by the hash of their content, so any change to them is reported. The video and any images embedded in descriptions are covered only by their URL, as part of the text: changes to their content are outside this guarantee, and only changes to their URL are tracked.',
    }),
    fields: processId
      ? [
          {
            label: t('process_pdf.metadata_audit.children_listed', {
              defaultValue: 'Question elections linked on chain',
            }),
            value: childIds.length ? childIds.map((id, index) => `${index + 1}. ${id}`).join('\n') : notAvailableLabel,
          },
        ]
      : undefined,
    versions: buildVersions(processAudit),
  }

  const questionEntries = entries.map(({ id, audit: questionAudit }): CertificateMetadataElection => {
    const match = questionsById.get(id)
    return {
      title: match
        ? t('process_pdf.metadata_audit.question_heading', {
            defaultValue: 'Question {{number}}: {{title}}',
            number: match.index + 1,
            title: match.question.title || notAvailableLabel,
          })
        : t('process_pdf.metadata_audit.unlisted_question', {
            defaultValue: 'Election {{id}}, not a question of this voting process',
            id,
          }),
      summary: !questionAudit?.available
        ? t('process_pdf.metadata_audit.history_unavailable', {
            defaultValue: 'The change history of this question could not be read.',
          })
        : getHistorySummary(questionAudit),
      versions: buildVersions(questionAudit),
    }
  })

  return {
    intro: t('process_pdf.metadata_audit.intro', {
      defaultValue:
        'Voters were shown a title, a description, media and the text of every question and option. The blockchain records the SHA-256 hash of the exact documents that contain this information when the voting process and each of its questions are published, and a new hash every time one of those documents is changed. This section lists every recorded version, checks each document against its hash, and shows what changed from one version to the next.',
    }),
    summary,
    integrityWarning: readable.some(hasIntegrityIssues)
      ? t('process_pdf.metadata_audit.integrity_warning', {
          defaultValue: 'Some versions could not be verified against their recorded hash. See the details below.',
        })
      : undefined,
    linkWarning: linksMismatch
      ? t('process_pdf.metadata_audit.links_mismatch', {
          defaultValue:
            'The elections linked on chain to the voting process do not match its questions. See the voting process details below.',
        })
      : undefined,
    legend: anyUpdates
      ? t('process_pdf.metadata_audit.legend', {
          defaultValue: 'Removed text is shown struck through in red, and added text underlined in green.',
        })
      : undefined,
    elections: [processEntry, ...questionEntries],
  }
}
