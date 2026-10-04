import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { render, screen, TestMemoryRouter, waitFor } from '~src/test-utils'
import { defaultProcessValues, type Process } from '../common'
import CensusCreation from './CensusCreation'

vi.mock('~src/queries/groups', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/queries/groups')>()),
  useAllGroups: () => ({ data: [{ id: 'everyone', title: 'All members', isAutoGroup: true, membersCount: 3 }] }),
}))

// Who can vote has its own tests; here it only has to be there
vi.mock('../Settings/WhoCanVote', () => ({ WhoCanVote: () => <div>Who can vote</div> }))
vi.mock('../VoterAuthentication', () => ({ VoterAuthentication: () => <button type='button'>Sign-in</button> }))

const GroupId = () => <output data-testid='group-id'>{useWatch<Process>({ name: 'groupId' }) as string}</output>

const Harness = ({ groupId = '' }: { groupId?: string }) => {
  const methods = useForm<Process>({ defaultValues: { ...defaultProcessValues, groupId } })
  return (
    <TestMemoryRouter>
      <FormProvider {...methods}>
        <CensusCreation />
        <GroupId />
      </FormProvider>
    </TestMemoryRouter>
  )
}

describe('CensusCreation', () => {
  it('shows who can vote and how they sign in', () => {
    render(<Harness />)

    expect(screen.getByText('Who can vote')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign-in' })).toBeInTheDocument()
  })

  it('starts a new vote with everyone', async () => {
    render(<Harness />)

    await waitFor(() => expect(screen.getByTestId('group-id')).toHaveTextContent('everyone'))
  })

  it('keeps the census a draft already has', async () => {
    render(<Harness groupId='own-copy' />)

    await waitFor(() => expect(screen.getByTestId('group-id')).toHaveTextContent('own-copy'))
  })
})
