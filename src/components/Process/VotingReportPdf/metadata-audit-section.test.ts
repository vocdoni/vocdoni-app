import { translate } from './__fixtures__'
import { type AuditedMetadataVersion, type ElectionMetadataAudit } from './metadata-audit'
import { type AuditedQuestion, buildMetadataAuditSection } from './metadata-audit-section'

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
  questionElections: null,
  ...overrides,
})

const createAudit = (electionId: string, versions: AuditedMetadataVersion[]): ElectionMetadataAudit => ({
  electionId,
  available: true,
  versions,
})

const PARENT = 'aa01'

const build = (
  audits?: ElectionMetadataAudit[] | null,
  questions: AuditedQuestion[] = [{ title: 'Chair', upstreamId: 'e1' }],
  process: AuditedQuestion = { title: 'Annual vote' }
) => buildMetadataAuditSection({ process, questions, audits, t: translate, notAvailableLabel: NA })

const createParentAudit = (questionElections: string[] | null, versions: Partial<AuditedMetadataVersion>[] = [{}]) =>
  createAudit(
    PARENT,
    versions.map((overrides) => createVersion({ questionElections, ...overrides }))
  )

describe('buildMetadataAuditSection', () => {
  it('says nothing changed when every question kept its original metadata', () => {
    const section = build([createAudit('e1', [createVersion()])])

    expect(section.summary).toBe(
      'No changes were made to the questions shown to voters after the voting process was created. Changes to the process title, description and media are not recorded on chain for this voting process.'
    )
    expect(section.legend).toBeUndefined()
    expect(section.integrityWarning).toBeUndefined()
    expect(section.elections).toHaveLength(2)
    expect(section.elections[0]).toEqual({
      title: 'Voting process: Annual vote',
      summary:
        'Changes to the process title, description and media are not recorded on chain for this voting process, because it was published before they were.',
      warning: undefined,
      fields: undefined,
      versions: [],
    })
    expect(section.elections[1].title).toBe('Question 1: Chair')
    expect(section.elections[1].summary).toBe('Unchanged since creation.')
    expect(section.elections[1].versions[0].heading).toBe('Original version')
    expect(section.elections[1].versions[0].fields.map((field) => field.value)).toEqual([
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
    expect(section.elections[1].summary).toBe('The change history of this question could not be read.')
    expect(section.elections[1].versions).toEqual([])
  })

  it('does not claim the process is unchanged when some histories could not be read', () => {
    const section = build(
      [createAudit('e1', [createVersion()]), { electionId: 'e2', available: false, versions: [] }],
      [
        { title: 'Chair', upstreamId: 'e1' },
        { title: 'Treasurer', upstreamId: 'e2' },
      ]
    )

    expect(section.summary).toContain('wherever its history could be read')
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
    expect(section.elections[1].summary).toBe('Changes after creation: 1.')

    const change = section.elections[1].versions[1]
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
    const [, mismatch] = section.elections[1].versions
    expect(mismatch.note).toContain('could not be retrieved or verified')
    expect(mismatch.fields[4]).toEqual({
      label: 'Integrity',
      value: 'Mismatch: the document available now does not match the hash recorded on chain',
      helperText: `Hash of the document available now: ${'cc'.repeat(32)}`,
    })
  })

  it('reports a version with no content change', () => {
    const section = build([createAudit('e1', [createVersion(), createVersion({ changes: [] })])])

    expect(section.elections[1].versions[1].note).toBe('The content shown to voters did not change.')
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

    expect(section.elections.map((election) => election.title)).toEqual([
      'Voting process: Annual vote',
      'Question 2: Treasurer',
    ])
    expect(section.elections[1].versions[0].fields.map((field) => field.value)).toEqual([
      NA,
      NA,
      NA,
      NA,
      'Not verifiable: no hash was recorded on chain for this version',
    ])
  })

  describe('with a parent election', () => {
    const questions = [
      { title: 'Chair', upstreamId: 'e1' },
      { title: 'Treasurer', upstreamId: 'e2' },
    ]
    const process = { title: 'Annual vote', upstreamId: PARENT }

    it('audits the process first and says nothing changed when no election did', () => {
      const section = build(
        [createParentAudit(['e1', 'e2']), createAudit('e1', [createVersion()]), createAudit('e2', [createVersion()])],
        questions,
        process
      )

      expect(section.summary).toBe(
        'No changes were made to the information shown to voters after the voting process was created.'
      )
      expect(section.questionElectionsWarning).toBeUndefined()
      const [processCard, ...questionCards] = section.elections
      expect(processCard.title).toBe('Voting process: Annual vote')
      expect(processCard.summary).toBe('Unchanged since creation.')
      expect(processCard.warning).toBeUndefined()
      expect(processCard.fields).toEqual([{ label: 'Question elections listed on chain', value: '1. e1\n2. e2' }])
      expect(processCard.versions).toHaveLength(1)
      expect(questionCards.map((card) => card.title)).toEqual(['Question 1: Chair', 'Question 2: Treasurer'])
    })

    it('follows the elections the parent lists and flags a mismatch with the questions', () => {
      const section = build(
        [
          createParentAudit(['e2', 'e3']),
          createAudit('e1', [createVersion()]),
          createAudit('e2', [createVersion()]),
          createAudit('e3', [createVersion()]),
        ],
        questions,
        process
      )

      expect(section.questionElectionsWarning).toContain('do not match its questions')
      expect(section.elections[0].warning).toBe(section.questionElectionsWarning)
      expect(section.elections.map((card) => card.title)).toEqual([
        'Voting process: Annual vote',
        'Question 2: Treasurer',
        'Election e3, not a question of this voting process',
        'Question 1: Chair',
      ])
    })

    it('flags a parent list in a different order than the questions', () => {
      const section = build(
        [createParentAudit(['e2', 'e1']), createAudit('e1', [createVersion()]), createAudit('e2', [createVersion()])],
        questions,
        process
      )

      expect(section.questionElectionsWarning).toBeDefined()
    })

    it('reports a change of the listed question elections as its own field', () => {
      const section = build(
        [
          createParentAudit(
            ['e1', 'e2'],
            [{}, { changes: [{ field: 'questionElections', before: 'e1\ne2', after: 'e1\ne2\ne3' }] }]
          ),
          createAudit('e1', [createVersion()]),
          createAudit('e2', [createVersion()]),
        ],
        questions,
        process
      )

      expect(section.summary).toContain('was changed after the voting process was created')
      expect(section.elections[0].versions[1].changes).toEqual([
        { kind: 'replace', label: 'Question elections', detail: undefined, before: 'e1\ne2', after: 'e1\ne2\ne3' },
      ])
    })

    it('says when the process history could not be read and audits the questions alone', () => {
      const section = build(
        [
          { electionId: PARENT, available: false, versions: [] },
          createAudit('e1', [createVersion()]),
          createAudit('e2', [createVersion()]),
        ],
        questions,
        process
      )

      expect(section.summary).toContain('wherever its history could be read')
      expect(section.elections[0].summary).toBe('The change history of the voting process could not be read.')
      expect(section.elections[0].fields).toEqual([{ label: 'Question elections listed on chain', value: NA }])
      expect(section.questionElectionsWarning).toBeUndefined()
      expect(section.elections.slice(1).map((card) => card.title)).toEqual([
        'Question 1: Chair',
        'Question 2: Treasurer',
      ])
    })
  })
})
