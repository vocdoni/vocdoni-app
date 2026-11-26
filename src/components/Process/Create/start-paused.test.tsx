import type { ReactNode } from 'react'
import { AllProviders, renderHook } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CensusTypes } from '../Census/CensusType'
import { defaultProcessValues, defaultQuestion, Process } from './common'
import { useFormToVotingProcessRequest } from './index'

vi.mock('~components/AnalyticsProvider', () => ({ useAnalytics: () => ({ trackPlausibleEvent: vi.fn() }) }))

const censusSpec = { type: CensusTypes.CSP } as never

const build = (startPaused: boolean, flag: boolean, over: Partial<Process> = {}) => {
  setReactProvidersMock({
    useOrganization: vi.fn().mockReturnValue({ organization: { address: 'org-address' } }),
  })
  const { result } = renderHook(() => useFormToVotingProcessRequest(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <AllProviders appEnv={{ QUESTION_BY_QUESTION: flag }}>{children}</AllProviders>
    ),
  })

  return result.current({ ...defaultProcessValues, title: 'Vote', startPaused, ...over }, censusSpec)
}

describe('useFormToVotingProcessRequest start paused', () => {
  it.each([true, false])('sends initialStatus PAUSED when the questions start paused (flag %s)', (flag) => {
    expect(build(true, flag)).toMatchObject({ initialStatus: 'PAUSED' })
  })

  it.each([true, false])('leaves initialStatus out when the questions start open (flag %s)', (flag) => {
    expect(build(false, flag)).not.toHaveProperty('initialStatus')
  })
})

describe('useFormToVotingProcessRequest results for voters', () => {
  it.each([false, true])('writes the choice on every question (startPaused %s)', (startPaused) => {
    const questions = [defaultQuestion, defaultQuestion]
    const on = build(startPaused, true, { showVoterResults: true, questions })
    expect(on.questions.map((question) => question.metadata)).toEqual([
      { voterResults: 'shown' },
      { voterResults: 'shown' },
    ])
    const off = build(startPaused, true, { showVoterResults: false, questions })
    expect(off.questions.map((question) => question.metadata)).toEqual([
      { voterResults: 'hidden' },
      { voterResults: 'hidden' },
    ])
  })

  it('keeps the choices metadata beside it', () => {
    const question = { ...defaultQuestion, extendedInfo: true, options: [{ option: 'A', description: 'Why' }] }
    const request = build(true, true, { showVoterResults: true, questions: [question] })
    expect(request.questions[0].metadata).toMatchObject({ voterResults: 'shown', choices: [{ value: 0 }] })
  })
})
