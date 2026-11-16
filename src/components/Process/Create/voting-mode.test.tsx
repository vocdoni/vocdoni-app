import type { ReactNode } from 'react'
import { AllProviders, renderHook } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CensusTypes } from '../Census/CensusType'
import { defaultProcessValues, Process } from './common'
import { useFormToVotingProcessRequest } from './index'

vi.mock('~components/AnalyticsProvider', () => ({ useAnalytics: () => ({ trackPlausibleEvent: vi.fn() }) }))

const censusSpec = { type: CensusTypes.CSP } as never

const build = (votingMode: Process['votingMode'], flag: boolean) => {
  setReactProvidersMock({
    useOrganization: vi.fn().mockReturnValue({ organization: { address: 'org-address' } }),
  })
  const { result } = renderHook(() => useFormToVotingProcessRequest(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <AllProviders appEnv={{ QUESTION_BY_QUESTION: flag }}>{children}</AllProviders>
    ),
  })

  return result.current({ ...defaultProcessValues, title: 'Vote', votingMode }, censusSpec)
}

describe('useFormToVotingProcessRequest voting mode', () => {
  it.each([true, false])('sends initialStatus PAUSED for byQuestion (flag %s)', (flag) => {
    expect(build('byQuestion', flag)).toMatchObject({ initialStatus: 'PAUSED' })
  })

  it.each([true, false])('leaves initialStatus out for all at once (flag %s)', (flag) => {
    expect(build('all', flag)).not.toHaveProperty('initialStatus')
  })
})
