import { type TFunction } from 'i18next'

import {
  type AuditedMetadataVersion,
  type DiffSegment,
  type ElectionMetadataAudit,
  type MetadataChange,
  condenseDiff,
  diffWords,
  hasIntegrityIssues,
  hasMetadataUpdates,
} from './metadata-audit'

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
  versions: CertificateMetadataVersion[]
}

export type CertificateMetadataAudit = {
  intro: string
  summary: string
  integrityWarning?: string
  legend?: string
  elections: CertificateMetadataElection[]
}

/** A question of the process, with the on-chain election that carries it. */
export type AuditedQuestion = { title: string; upstreamId?: string }

const TEXT_FIELDS = new Set<MetadataChange['field']>([
  'title',
  'description',
  'questionTitle',
  'questionDescription',
  'choiceTitle',
])

const formatTimestamp = (date: Date | null) =>
  date ? `${date.toISOString().slice(0, 19).replace('T', ' ')} UTC` : null

const getIntegrityText = (version: AuditedMetadataVersion, t: TFunction) => {
  switch (version.integrity) {
    case 'verified':
      return t('process_pdf.metadata_audit.integrity.verified', {
        defaultValue: 'Verified: the document matches the hash recorded on chain',
      })
    case 'mismatch':
      return t('process_pdf.metadata_audit.integrity.mismatch', {
        defaultValue: 'Mismatch: the document available now does not match the hash recorded on chain',
      })
    case 'unrecorded':
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
    detail: change.mediaUrl,
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
        value: version.recordedHash || notAvailableLabel,
      },
      {
        label: t('process_pdf.metadata_audit.integrity.label', { defaultValue: 'Integrity' }),
        value: getIntegrityText(version, t),
        helperText:
          version.integrity === 'mismatch'
            ? t('process_pdf.metadata_audit.integrity.computed_hash', {
                defaultValue: 'Hash of the document available now: {{hash}}',
                hash: version.computedHash,
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
 * The "Metadata changes" section: one entry per question, each listing the metadata versions of its
 * on-chain election with their integrity check and the differences against the previous version.
 * `audits` is undefined when the history was not read at all.
 */
export const buildMetadataAuditSection = ({
  questions,
  audits,
  t,
  notAvailableLabel,
}: {
  questions: AuditedQuestion[]
  audits?: ElectionMetadataAudit[] | null
  t: TFunction
  notAvailableLabel: string
}): CertificateMetadataAudit => {
  const auditsById = new Map((audits ?? []).map((audit) => [audit.electionId, audit]))
  const entries = questions
    .map((question, index) => ({ question, index, audit: auditsById.get(question.upstreamId ?? '') }))
    .filter(({ question }) => question.upstreamId)
  const readable = entries.flatMap(({ audit }) => (audit?.available ? [audit] : []))
  const anyUnreadable = readable.length < entries.length
  const anyUpdates = readable.some(hasMetadataUpdates)

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
        'No changes were made to the information shown to voters in the questions whose history could be read. The history of the other questions could not be read.',
    })
  } else {
    summary = t('process_pdf.metadata_audit.summary_unchanged', {
      defaultValue: 'No changes were made to the information shown to voters after the voting process was created.',
    })
  }

  return {
    intro: t('process_pdf.metadata_audit.intro', {
      defaultValue:
        'Voters were shown a title, a description, media and the text of every question and option. The blockchain records the SHA-256 hash of the exact document that contains this information when each question is created, and a new hash every time that document is changed. This section lists every recorded version, checks each document against its hash, and shows what changed from one version to the next.',
    }),
    summary,
    integrityWarning: readable.some(hasIntegrityIssues)
      ? t('process_pdf.metadata_audit.integrity_warning', {
          defaultValue: 'Some versions could not be verified against their recorded hash. See the details below.',
        })
      : undefined,
    legend: anyUpdates
      ? t('process_pdf.metadata_audit.legend', {
          defaultValue: 'Removed text is shown struck through in red, and added text underlined in green.',
        })
      : undefined,
    elections: entries.map(({ question, index, audit }) => ({
      title: t('process_pdf.metadata_audit.question_heading', {
        defaultValue: 'Question {{number}}: {{title}}',
        number: index + 1,
        title: question.title || notAvailableLabel,
      }),
      summary: !audit?.available
        ? t('process_pdf.metadata_audit.history_unavailable', {
            defaultValue: 'The change history of this question could not be read.',
          })
        : hasMetadataUpdates(audit)
          ? t('process_pdf.metadata_audit.question_changed', {
              defaultValue: 'Changes after creation: {{changes}}.',
              changes: audit.versions.length - 1,
            })
          : t('process_pdf.metadata_audit.question_unchanged', { defaultValue: 'Unchanged since creation.' }),
      versions: audit?.available
        ? audit.versions.map((version, versionIndex) => buildVersion(version, versionIndex, t, notAvailableLabel))
        : [],
    })),
  }
}
