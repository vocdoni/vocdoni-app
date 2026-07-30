import type { VotingProcessQuestion, VotingProcessResponse } from '@vocdoni/api-types'
import { SelectorTypes } from './common'
import { votingProcessToCreateRequest, votingProcessToForm } from './draft-mapping'

const BALLOT_PROTOCOL = {
  costExponent: 1,
  costFromWeight: false,
  maxVoteOverwrites: 0,
  maxCount: 1,
  maxValue: 1,
  maxTotalCost: 1,
  uniqueValues: false,
}

type MockChoice = { title: string; description?: string; image?: string }

const question = (choices: MockChoice[], overrides: Partial<VotingProcessQuestion> = {}): VotingProcessQuestion => {
  const hasMeta = choices.some((c) => c.description !== undefined || c.image !== undefined)

  return {
    id: 'question-1',
    parentProcessId: 'process-1',
    title: { default: 'Question title' },
    description: { default: 'Question description' },
    choices: choices.map((choice, index) => ({ title: { default: choice.title }, value: index })),
    ballotProtocol: BALLOT_PROTOCOL,
    type: 'singlechoice',
    secretUntilTheEnd: false,
    status: 'ONGOING',
    metadata: hasMeta
      ? { choices: choices.map((c, index) => ({ value: index, description: c.description, image: c.image })) }
      : undefined,
    ...overrides,
  }
}

const process = (overrides: Partial<VotingProcessResponse> = {}): VotingProcessResponse =>
  ({
    id: 'process-1',
    orgAddress: 'organization',
    published: false,
    title: { default: 'Process title' },
    description: { default: 'Process description' },
    census: {},
    questions: [question([{ title: 'Option 1' }, { title: 'Option 2' }])],
    ...overrides,
  }) as VotingProcessResponse

describe('votingProcessToForm', () => {
  it('restores the process texts and its questions', () => {
    const form = votingProcessToForm(process())

    expect(form.title).toBe('Process title')
    expect(form.description).toBe('Process description')
    expect(form.questions).toEqual([
      {
        title: 'Question title',
        description: 'Question description',
        type: SelectorTypes.Single,
        extendedInfo: false,
        minNumberOfChoices: null,
        maxNumberOfChoices: null,
        options: [
          { option: 'Option 1', description: undefined, image: undefined },
          { option: 'Option 2', description: undefined, image: undefined },
        ],
      },
    ])
  })

  describe('extended info', () => {
    it('is off when no choice carries a description or an image', () => {
      expect(votingProcessToForm(process()).questions[0].extendedInfo).toBe(false)
    })

    it.each([
      ['a description', { title: 'Option 1', description: 'Why' }],
      ['an image', { title: 'Option 1', image: 'https://example.com/1.png' }],
    ])('is on when a choice carries %s', (_label, choice) => {
      const form = votingProcessToForm(process({ questions: [question([choice, { title: 'Option 2' }])] }))

      expect(form.questions[0].extendedInfo).toBe(true)
    })

    it.each([
      ['description', { title: 'Option 1', description: '' }],
      ['image', { title: 'Option 1', image: '' }],
    ])('stays on when the stored %s is empty', (_label, choice) => {
      // The wizard only writes `metadata.choices` when the toggle is on, so the
      // block being there is the signal — its contents may still be empty.
      const form = votingProcessToForm(process({ questions: [question([choice, { title: 'Option 2' }])] }))

      expect(form.questions[0].extendedInfo).toBe(true)
    })

    it('survives a round-trip of a toggle enabled but not yet filled in', () => {
      // Enabling the toggle without typing anything emits
      // `{ value, description: undefined, image: undefined }`, and JSON drops the
      // undefined members — so what comes back is a bare `{ value }`. Inferring
      // the flag from the contents lost the toggle on reload.
      const enabledButEmpty = question([{ title: 'Option 1' }], {
        metadata: { choices: [{ value: 0, description: undefined, image: undefined }] },
      })
      const stored = JSON.parse(JSON.stringify(enabledButEmpty))

      expect(stored.metadata.choices).toEqual([{ value: 0 }])
      expect(votingProcessToForm(process({ questions: [stored] })).questions[0].extendedInfo).toBe(true)
    })

    it('is restored per question', () => {
      const form = votingProcessToForm(
        process({
          questions: [
            question([{ title: 'Option 1', description: 'Why' }]),
            question([{ title: 'Option 1' }], { id: 'question-2' }),
          ],
        })
      )

      expect(form.questions.map((q) => q.extendedInfo)).toEqual([true, false])
    })

    it('maps each choice back to its own description and image', () => {
      const form = votingProcessToForm(
        process({
          questions: [
            question([
              { title: 'Option 1', description: 'Why 1', image: 'https://example.com/1.png' },
              { title: 'Option 2' },
            ]),
          ],
        })
      )

      expect(form.questions[0].options).toEqual([
        { option: 'Option 1', description: 'Why 1', image: 'https://example.com/1.png' },
        { option: 'Option 2', description: undefined, image: undefined },
      ])
    })

    it('tolerates question metadata without a choices list', () => {
      const form = votingProcessToForm(
        process({ questions: [question([{ title: 'Option 1' }], { metadata: { something: 'else' } })] })
      )

      expect(form.questions[0].extendedInfo).toBe(false)
      expect(form.questions[0].options).toEqual([{ option: 'Option 1', description: undefined, image: undefined }])
    })
  })

  describe('question type', () => {
    it('maps a single-choice question without choice limits', () => {
      const [first] = votingProcessToForm(process()).questions

      expect(first.type).toBe(SelectorTypes.Single)
      expect(first.minNumberOfChoices).toBeNull()
      expect(first.maxNumberOfChoices).toBeNull()
    })

    it('maps a multi-choice question with its limits', () => {
      const [first] = votingProcessToForm(
        process({
          questions: [
            question([{ title: 'A' }, { title: 'B' }, { title: 'C' }], {
              type: 'multichoice',
              typeSetup: { maxChoices: 2, minChoices: 1, uniqueChoices: true },
            }),
          ],
        })
      ).questions

      expect(first.type).toBe(SelectorTypes.Multiple)
      expect(first.minNumberOfChoices).toBe(1)
      expect(first.maxNumberOfChoices).toBe(2)
    })

    it('keeps every question on its own type and limits', () => {
      const form = votingProcessToForm(
        process({
          questions: [
            question([{ title: 'A' }, { title: 'B' }]),
            question([{ title: 'A' }, { title: 'B' }, { title: 'C' }], {
              id: 'question-2',
              type: 'multichoice',
              typeSetup: { maxChoices: 3, minChoices: 2, uniqueChoices: true },
            }),
          ],
        })
      )

      expect(form.questions.map((q) => q.type)).toEqual([SelectorTypes.Single, SelectorTypes.Multiple])
      expect(form.questions.map((q) => q.minNumberOfChoices)).toEqual([null, 2])
      expect(form.questions.map((q) => q.maxNumberOfChoices)).toEqual([null, 3])
    })

    it('falls back to the ballot protocol max count when the type setup is missing', () => {
      const [first] = votingProcessToForm(
        process({
          questions: [
            question([{ title: 'A' }, { title: 'B' }], {
              type: 'multichoice',
              typeSetup: undefined,
              ballotProtocol: { ...BALLOT_PROTOCOL, maxCount: 2 },
            }),
          ],
        })
      ).questions

      expect(first.maxNumberOfChoices).toBe(2)
    })
  })

  describe('schedule', () => {
    it('marks the process as auto-starting when it has no start date', () => {
      const form = votingProcessToForm(process({ endDate: '2026-03-02T18:30:00Z' }))

      expect(form.autoStart).toBe(true)
      expect(form.startDate).toBe('')
      expect(form.startTime).toBe('')
    })

    it('splits the stored dates into the wizard date and time fields', () => {
      // Built from local-time parts so the assertion holds in any timezone: the
      // wizard edits local wall-clock values, the API stores instants.
      const start = new Date(2026, 2, 1, 9, 15)
      const form = votingProcessToForm(process({ startDate: start.toISOString() }))

      expect(form.autoStart).toBe(false)
      expect(form.startDate).toBe('2026-03-01')
      expect(form.startTime).toBe('09:15')
    })
  })

  describe('census', () => {
    it('restores the credentials and the two-factor method', () => {
      const form = votingProcessToForm(
        process({ census: { weighted: true, authFields: ['memberNumber'], twoFaFields: ['email', 'phone'] } })
      )

      expect(form.weightedVote).toBe(true)
      expect(form.census).toEqual({
        credentials: ['memberNumber'],
        use2FA: true,
        use2FAMethod: 'voter_choice',
      })
    })

    it.each([
      [['email'], 'email'],
      [['phone'], 'sms'],
    ])('maps %s to the %s method', (twoFaFields, expected) => {
      const form = votingProcessToForm(process({ census: { authFields: ['nationalId'], twoFaFields } as any }))

      expect(form.census?.use2FAMethod).toBe(expected)
    })

    it('leaves the credentials unset when the census has none', () => {
      expect(votingProcessToForm(process()).census).toBeNull()
    })

    it('restores the member group the census targeted', () => {
      expect(votingProcessToForm(process({ census: { groupId: 'group-1' } })).groupId).toBe('group-1')
    })

    it('targets no group for an organization-wide census', () => {
      expect(votingProcessToForm(process()).groupId).toBe('')
    })
  })

  it('hides the results when a question is secret until the end', () => {
    const secret = process({ questions: [question([{ title: 'A' }], { secretUntilTheEnd: true })] })

    expect(votingProcessToForm(secret).resultVisibility).toBe('hidden')
    expect(votingProcessToForm(process()).resultVisibility).toBe('live')
  })
})

describe('votingProcessToCreateRequest', () => {
  it('drops the source schedule so the copy is scheduled afresh', () => {
    const request = votingProcessToCreateRequest(
      process({ startDate: '2024-01-01T00:00:00Z', endDate: '2024-01-31T00:00:00Z' }),
      '0xorg'
    )

    expect(request.startDate).toBeUndefined()
    expect(request.endDate).toBeUndefined()
    expect(request.orgAddress).toBe('0xorg')
  })

  it('keeps the census group so the copy targets the same members', () => {
    const request = votingProcessToCreateRequest(process({ census: { groupId: 'group-1' } }), '0xorg')

    expect(request.census?.groupId).toBe('group-1')
  })

  it('keeps the named question type and its setup', () => {
    const request = votingProcessToCreateRequest(
      process({
        questions: [
          question([{ title: 'A' }, { title: 'B' }], {
            type: 'multichoice',
            typeSetup: { maxChoices: 2, minChoices: 1, uniqueChoices: true },
          }),
        ],
      }),
      '0xorg'
    )

    expect(request.questions[0]).toMatchObject({
      type: 'multichoice',
      typeSetup: { maxChoices: 2, minChoices: 1, uniqueChoices: true },
    })
    expect(request.questions[0].ballotProtocol).toBeUndefined()
  })

  it('sends the raw ballot protocol when the question has no named type', () => {
    const request = votingProcessToCreateRequest(
      process({ questions: [question([{ title: 'A' }], { type: '' })] }),
      '0xorg'
    )

    expect(request.questions[0].type).toBeUndefined()
    expect(request.questions[0].ballotProtocol).toEqual(BALLOT_PROTOCOL)
  })
})
