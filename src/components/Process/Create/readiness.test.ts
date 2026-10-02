import { defaultProcessValues, defaultQuestion, Process, SelectorTypes } from './common'
import { getReadiness } from './readiness'

const now = new Date(2026, 8, 28, 10, 0)

const ready: Process = {
  ...defaultProcessValues,
  title: 'Board election 2026',
  questions: [{ ...defaultQuestion, title: 'Approve the accounts?', options: [{ option: 'Yes' }, { option: 'No' }] }],
  groupId: 'group-1',
  census: { credentials: ['memberNumber'], use2FA: true, use2FAMethod: 'email' },
  endDate: '2026-10-05',
  endTime: '20:00',
}

const codes = (values: Process, context = {}) =>
  getReadiness(values, { now, ...context }).issues.map((issue) => issue.code)

describe('getReadiness', () => {
  it('is fully ready when everything is filled in', () => {
    const readiness = getReadiness(ready, { now, maxDays: 30, groupMembers: 12 })
    expect(readiness.readyCount).toBe(4)
    expect(readiness.total).toBe(4)
    expect(readiness.first).toBeUndefined()
  })

  it('starts a new vote with the title, questions, voters and closing date to do', () => {
    const readiness = getReadiness(defaultProcessValues, { now })
    expect(readiness.issues.map((issue) => issue.code)).toEqual([
      'title_missing',
      'question_title_missing',
      'option_missing',
      'group_missing',
      'end_missing',
    ])
    // Privacy and results always have sensible defaults
    expect(readiness.readyCount).toBe(1)
    expect(readiness.first).toEqual({ section: 'ballot', code: 'title_missing', field: 'title' })
  })

  it('points each question issue at the field to fix', () => {
    const values = {
      ...ready,
      questions: [
        ready.questions[0],
        { ...defaultQuestion, title: 'Board', options: [{ option: 'Anna' }, { option: '' }] },
      ],
    }
    expect(getReadiness(values, { now }).first).toEqual({
      section: 'ballot',
      code: 'option_missing',
      field: 'questions.1.options.1.option',
      question: 1,
    })
  })

  it('ignores empty extra options, which are dropped on review', () => {
    const question = { ...ready.questions[0], options: [{ option: 'Yes' }, { option: 'No' }, { option: '' }] }
    expect(codes({ ...ready, questions: [question] })).toEqual([])
  })

  it('flags a minimum above the maximum on a multiple-choice question', () => {
    const question = {
      ...ready.questions[0],
      type: SelectorTypes.Multiple,
      minNumberOfChoices: 3,
      maxNumberOfChoices: 2,
      options: [{ option: 'A' }, { option: 'B' }, { option: 'C' }],
    }
    expect(codes({ ...ready, questions: [question] })).toEqual(['limits_invalid'])
  })

  it('needs sign-in once a group is chosen, and flags an empty group', () => {
    expect(codes({ ...ready, census: null })).toEqual(['sign_in_missing'])
    expect(codes(ready, { groupMembers: 0 })).toEqual(['group_empty'])
    expect(codes({ ...ready, groupId: '' })).toEqual(['group_missing'])
  })

  it('warns, without blocking, when some voters can’t get a code', () => {
    const readiness = getReadiness(ready, { now, unreachable: 3 })
    expect(readiness.issues).toEqual([])
    expect(readiness.first).toBeUndefined()
    expect(readiness.warnings).toEqual([{ section: 'voters', code: 'census_unreachable', field: 'groupId' }])
    expect(getReadiness(ready, { now, unreachable: 0 }).warnings).toEqual([])
  })

  it('reports schedule issues against the date field to fix', () => {
    const readiness = getReadiness({ ...ready, endDate: '2026-12-31' }, { now, maxDays: 30 })
    expect(readiness.sections.schedule).toEqual({
      ready: false,
      issues: [{ section: 'schedule', code: 'too_long', field: 'endDate' }],
    })
    expect(readiness.readyCount).toBe(3)
  })
})
