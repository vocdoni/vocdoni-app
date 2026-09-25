import i18n from 'i18next'
import { FormProvider, useForm } from 'react-hook-form'
import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { Census, defaultProcessValues } from '../common'
import CensusCreation, { CensusStatusBadge, formatGroupOptionLabel } from './CensusCreation'

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
