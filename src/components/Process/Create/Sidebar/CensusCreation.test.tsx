import userEvent from '@testing-library/user-event'
import i18n from 'i18next'
import { FormProvider, useForm, UseFormReturn, useFormContext } from 'react-hook-form'
import { Group } from '~src/queries/groups'
import { act, render, screen, TestMemoryRouter } from '~src/test-utils'
import { Census, defaultProcessValues, Process } from '../common'
import CensusCreation, { CensusStatusBadge, formatGroupOptionLabel, GroupSelect } from './CensusCreation'

const mockToast = vi.fn()

// The test render wraps everything in the real ToastProvider, so keep it.
vi.mock('~components/Toast', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~components/Toast')>()),
  useToast: () => mockToast,
}))

vi.mock('~src/queries/groups', () => ({
  useGroups: () => ({
    data: [],
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetching: false,
  }),
}))

const CensusCreationHarness = () => {
  const methods = useForm({ defaultValues: defaultProcessValues })

  return (
    <TestMemoryRouter>
      <FormProvider {...methods}>
        <CensusCreation />
      </FormProvider>
    </TestMemoryRouter>
  )
}

const BadgeHarness = ({ groupId = '', census = null }: { groupId?: string; census?: Census | null }) => {
  const methods = useForm({ defaultValues: { ...defaultProcessValues, groupId, census } })

  return (
    <FormProvider {...methods}>
      <CensusStatusBadge />
    </FormProvider>
  )
}

const groups = [
  { id: 'group-1', title: 'Board', membersCount: 5 },
  { id: 'group-2', title: 'Staff', membersCount: 9 },
] as Group[]

const configuredCensus: Census = { credentials: ['email'], use2FA: false, use2FAMethod: 'email' }

const CensusValue = () => {
  const { watch } = useFormContext<Process>()
  return <div data-testid='census'>{JSON.stringify(watch('census'))}</div>
}

let formRef: UseFormReturn<Process>

const GroupSelectHarness = () => {
  const methods = useForm<Process>({
    defaultValues: { ...defaultProcessValues, groupId: 'group-1', census: configuredCensus },
  })
  formRef = methods

  return (
    <FormProvider {...methods}>
      <GroupSelect groups={groups} fetchNextPage={vi.fn()} hasNextPage={false} isFetching={false} />
      <CensusValue />
    </FormProvider>
  )
}

const pickGroup = async (title: string) => {
  const user = userEvent.setup()
  await user.click(screen.getByRole('combobox'))
  await user.click(await screen.findByRole('option', { name: new RegExp(title) }))
}

describe('GroupSelect', () => {
  beforeEach(() => mockToast.mockClear())

  // The census was validated against the group it was set up for.
  it('resets voter authentication when the user picks a different group', async () => {
    render(<GroupSelectHarness />)

    await pickGroup('Staff')

    expect(formRef.getValues('groupId')).toBe('group-2')
    expect(screen.getByTestId('census')).toHaveTextContent('null')
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'info', title: 'Voter authentication was reset' })
    )
  })

  it('keeps voter authentication when the same group is picked again', async () => {
    render(<GroupSelectHarness />)

    await pickGroup('Board')

    expect(screen.getByTestId('census')).toHaveTextContent('"credentials":["email"]')
    expect(mockToast).not.toHaveBeenCalled()
  })

  // Drafts restore groupId and census through setValue, not through the select.
  it('keeps voter authentication when the group is set programmatically, as a draft load does', () => {
    render(<GroupSelectHarness />)

    act(() => formRef.setValue('groupId', 'group-2', { shouldDirty: true }))

    expect(screen.getByTestId('census')).toHaveTextContent('"credentials":["email"]')
    expect(mockToast).not.toHaveBeenCalled()
  })
})

describe('CensusStatusBadge', () => {
  it('counts both steps as missing on a fresh form', () => {
    render(<BadgeHarness />)
    expect(screen.getByText('2 steps left')).toBeInTheDocument()
  })

  // Picking a group is only half of the census: the badge must not read as done.
  it('still reports a step left once a group is picked', () => {
    render(<BadgeHarness groupId='group-1' />)
    expect(screen.getByText('1 step left')).toBeInTheDocument()
  })

  it('reads ready once voter authentication is configured too', () => {
    render(<BadgeHarness groupId='group-1' census={{ credentials: ['email'], use2FA: false, use2FAMethod: 'email' }} />)
    expect(screen.getByText('Ready')).toBeInTheDocument()
  })
})

describe('CensusCreation', () => {
  it('renders group empty state without crashing', () => {
    i18n.addResource(
      'en',
      'common',
      'process_create.census.group.no_groups',
      'To start a vote, you first need to create a group of eligible voters from your memberbase. <0/>.'
    )
    expect(() => render(<CensusCreationHarness />)).not.toThrow()
  })

  it('shows the group member count in the dropdown menu label', () => {
    const label = formatGroupOptionLabel(
      { id: 'group-1', title: 'Aitors team', membersCount: 12 } as never,
      {
        context: 'menu',
      } as never
    )

    const { container, getByText, queryByText } = render(<>{label}</>)

    expect(getByText('Aitors team')).toBeInTheDocument()
    expect(getByText('12')).toBeInTheDocument()
    expect(queryByText('members')).not.toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
