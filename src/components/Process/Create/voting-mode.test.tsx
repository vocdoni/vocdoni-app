import type { ReactNode } from 'react'
import { AllProviders, renderHook } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CensusTypes } from '../Census/CensusType'
import { defaultProcessValues, defaultQuestion, Process } from './common'
import { useFormToVotingProcessRequest } from './index'

vi.mock('~components/AnalyticsProvider', () => ({ useAnalytics: () => ({ trackPlausibleEvent: vi.fn() }) }))

const censusSpec = { type: CensusTypes.CSP } as never

const build = (votingMode: Process['votingMode'], flag: boolean, over: Partial<Process> = {}) => {
  setReactProvidersMock({
    useOrganization: vi.fn().mockReturnValue({ organization: { address: 'org-address' } }),
  })
  const { result } = renderHook(() => useFormToVotingProcessRequest(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <AllProviders appEnv={{ QUESTION_BY_QUESTION: flag }}>{children}</AllProviders>
    ),
  })

  return result.current({ ...defaultProcessValues, title: 'Vote', votingMode, ...over }, censusSpec)
}

describe('useFormToVotingProcessRequest voting mode', () => {
  it.each([true, false])('sends initialStatus PAUSED for byQuestion (flag %s)', (flag) => {
    expect(build('byQuestion', flag)).toMatchObject({ initialStatus: 'PAUSED' })
  })

  it.each([true, false])('leaves initialStatus out for all at once (flag %s)', (flag) => {
    expect(build('all', flag)).not.toHaveProperty('initialStatus')
  })
})

describe('useFormToVotingProcessRequest results for voters', () => {
  it.each(['all', 'byQuestion'] as const)('writes the choice on every question (%s)', (mode) => {
    const questions = [defaultQuestion, defaultQuestion]
    const on = build(mode, true, { showVoterResults: true, questions })
    expect(on.questions.map((question) => question.metadata)).toEqual([
      { voterResults: 'shown' },
      { voterResults: 'shown' },
    ])
    const off = build(mode, true, { showVoterResults: false, questions })
    expect(off.questions.map((question) => question.metadata)).toEqual([
      { voterResults: 'hidden' },
      { voterResults: 'hidden' },
    ])
  })

  it('keeps the choices metadata beside it', () => {
    const question = { ...defaultQuestion, extendedInfo: true, options: [{ option: 'A', description: 'Why' }] }
    const request = build('byQuestion', true, { showVoterResults: true, questions: [question] })
    expect(request.questions[0].metadata).toMatchObject({ voterResults: 'shown', choices: [{ value: 0 }] })
  })
})
