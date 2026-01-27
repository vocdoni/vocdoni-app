import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import { CensusTypes } from '~components/Process/Census/CensusType'
import { render, screen, waitFor } from '~src/test-utils'
import { VoterAuthentication } from '.'
import { Process, SelectorTypes } from '../common'
import { ExtraConfig } from '../Sidebar/ExtraConfig'

const mockBearedFetch = vi.fn()

vi.mock('@vocdoni/react-providers', () => ({
  useOrganization: () => ({ organization: { address: '0x1' } }),
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    bearedFetch: mockBearedFetch,
  }),
}))

type FormWatcherProps = { name: keyof Process }

const FormWatcher = ({ name }: FormWatcherProps) => {
  const { watch } = useFormContext<Process>()
  const value = watch(name)

  return <div data-testid={`form-${name}`}>{JSON.stringify(value)}</div>
}

const TestForm = () => {
  const methods = useForm<Process>({
    defaultValues: {
      title: '',
      description: '',
      autoStart: true,
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      extendedInfo: false,
      questionType: SelectorTypes.Single,
      questions: [{ title: '', description: '', options: [{ option: '' }, { option: '' }] }],
      maxNumberOfChoices: null,
      minNumberOfChoices: null,
      resultVisibility: 'hidden',
      weightedVote: false,
      voterPrivacy: 'public',
      groupId: 'group-1',
      census: {
        id: 'census-old',
        credentials: ['email'],
        size: 10,
        use2FA: false,
        use2FAMethod: 'email',
      },
      censusType: CensusTypes.CSP,
      streamUri: '',
      addresses: [],
      spreadsheet: null,
    },
  })

  return (
    <FormProvider {...methods}>
      <ExtraConfig />
      <VoterAuthentication />
      <FormWatcher name='census' />
    </FormProvider>
  )
}

describe('VoterAuthentication weightedVote changes', () => {
  it('recreates census when weightedVote changes', async () => {
    mockBearedFetch.mockResolvedValueOnce({ id: 'census-new' }).mockResolvedValueOnce({ size: 42 })

    const user = userEvent.setup()
    render(<TestForm />)

    expect(screen.getByTestId('form-census')).toHaveTextContent('census-old')

    const selects = screen.getAllByRole('combobox')
    await user.click(selects[1])
    await user.click(await screen.findByText('Weighted by voting power'))

    await waitFor(() => {
      expect(screen.getByTestId('form-census')).toHaveTextContent('census-new')
      expect(screen.getByTestId('form-census')).toHaveTextContent('"size":42')
    })
  })
})
