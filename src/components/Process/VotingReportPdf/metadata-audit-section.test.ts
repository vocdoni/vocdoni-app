import { translate } from './__fixtures__'
import { type AuditedMetadataVersion, type ElectionMetadataAudit } from './metadata-audit'
import { buildMetadataAuditSection } from './metadata-audit-section'

const NA = 'Not available'

const createVersion = (overrides: Partial<AuditedMetadataVersion> = {}): AuditedMetadataVersion => ({
  metadataURL: 'https://store.example/v1',
  recordedHash: 'aa'.repeat(32),
  computedHash: 'aa'.repeat(32),
  blockHeight: 100,
  txHash: 'ab'.repeat(32),
  timestamp: new Date('2026-01-01T10:00:00Z'),
  integrity: 'verified',
  changes: null,
  ...overrides,
})

const createAudit = (electionId: string, versions: AuditedMetadataVersion[]): ElectionMetadataAudit => ({
  electionId,
  available: true,
  versions,
})

const build = (audits?: ElectionMetadataAudit[] | null, questions = [{ title: 'Chair', upstreamId: 'e1' }]) =>
  buildMetadataAuditSection({ questions, audits, t: translate, notAvailableLabel: NA })

describe('buildMetadataAuditSection', () => {
  it('says nothing changed when every question kept its original metadata', () => {
    const section = build([createAudit('e1', [createVersion()])])

    expect(section.summary).toBe(
      'No changes were made to the information shown to voters after the voting process was created.'
    )
    expect(section.legend).toBeUndefined()
    expect(section.integrityWarning).toBeUndefined()
    expect(section.elections).toHaveLength(1)
    expect(section.elections[0].title).toBe('Question 1: Chair')
    expect(section.elections[0].summary).toBe('Unchanged since creation.')
    expect(section.elections[0].versions[0].heading).toBe('Original version')
    expect(section.elections[0].versions[0].fields.map((field) => field.value)).toEqual([
      '2026-01-01 10:00:00 UTC',
      '100',
      'ab'.repeat(32),
      'aa'.repeat(32),
      'Verified: the document matches the hash recorded on chain',
    ])
  })

  it('says the history could not be read when it was not fetched', () => {
    const section = build(undefined)

    expect(section.summary).toBe('The change history of the information shown to voters could not be read.')
    expect(section.elections[0].summary).toBe('The change history of this question could not be read.')
    expect(section.elections[0].versions).toEqual([])
  })

  it('does not claim the process is unchanged when some histories could not be read', () => {
    const section = build(
      [createAudit('e1', [createVersion()]), { electionId: 'e2', available: false, versions: [] }],
      [
        { title: 'Chair', upstreamId: 'e1' },
        { title: 'Treasurer', upstreamId: 'e2' },
      ]
    )

    expect(section.summary).toContain('in the questions whose history could be read')
  })

  it('lists every change with its date, block, transaction and readable differences', () => {
    const section = build([
      createAudit('e1', [
        createVersion(),
        createVersion({
          blockHeight: 120,
          timestamp: new Date('2026-01-01T12:30:00Z'),
          changes: [
            { field: 'title', lang: 'es', before: 'Presidencia', after: 'Presidencia de la junta' },
            { field: 'streamUri', before: null, after: 'https://video.example/v' },
            { field: 'choiceTitle', question: 0, choice: 1, lang: 'default', before: 'Alice', after: 'Alicia' },
            { field: 'other', before: null, after: null },
          ],
        }),
      ]),
    ])

    expect(section.summary).toContain('was changed after the voting process was created')
    expect(section.legend).toBeDefined()
    expect(section.elections[0].summary).toBe('Changes after creation: 1.')

    const change = section.elections[0].versions[1]
    expect(change.heading).toBe('Change 1')
    expect(change.fields[0].value).toBe('2026-01-01 12:30:00 UTC')
    expect(change.fields[1].value).toBe('120')
    expect(change.note).toBeUndefined()
    expect(change.changes).toEqual([
      {
        kind: 'inline',
        label: 'Title (es)',
        segments: [
          { type: 'same', text: 'Presidencia' },
          { type: 'added', text: ' de la junta' },
        ],
      },
      {
        kind: 'replace',
        label: 'Video',
        detail: undefined,
        before: '(none)',
        after: 'https://video.example/v',
      },
      {
        kind: 'inline',
        label: 'Option 2',
        segments: [
          { type: 'removed', text: 'Alice' },
          { type: 'added', text: 'Alicia' },
        ],
      },
      {
        kind: 'note',
        label: 'Other settings',
        text: 'Other parts of the document that are not listed above changed.',
      },
    ])
  })

  it('explains versions that could not be compared and shows the hash of a mismatching document', () => {
    const section = build([
      createAudit('e1', [createVersion(), createVersion({ integrity: 'mismatch', computedHash: 'cc'.repeat(32) })]),
    ])

    expect(section.integrityWarning).toBeDefined()
    const [, mismatch] = section.elections[0].versions
    expect(mismatch.note).toContain('could not be retrieved or verified')
    expect(mismatch.fields[4]).toEqual({
      label: 'Integrity',
      value: 'Mismatch: the document available now does not match the hash recorded on chain',
      helperText: `Hash of the document available now: ${'cc'.repeat(32)}`,
    })
  })

  it('reports a version with no content change', () => {
    const section = build([createAudit('e1', [createVersion(), createVersion({ changes: [] })])])

    expect(section.elections[0].versions[1].note).toBe('The content shown to voters did not change.')
  })

  it('numbers questions by their position in the process and fills unknown values', () => {
    const section = build(
      [
        createAudit('e2', [
          createVersion({ blockHeight: 0, txHash: '', recordedHash: '', timestamp: null, integrity: 'unrecorded' }),
        ]),
      ],
      [
        { title: 'Draft', upstreamId: undefined },
        { title: 'Treasurer', upstreamId: 'e2' },
      ]
    )

    expect(section.elections.map((election) => election.title)).toEqual(['Question 2: Treasurer'])
    expect(section.elections[0].versions[0].fields.map((field) => field.value)).toEqual([
      NA,
      NA,
      NA,
      NA,
      'Not verifiable: no hash was recorded on chain for this version',
    ])
  })
})
