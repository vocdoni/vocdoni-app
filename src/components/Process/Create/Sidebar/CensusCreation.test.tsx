import i18n from 'i18next'
import { FormProvider, useForm } from 'react-hook-form'
import { render, TestMemoryRouter } from '~src/test-utils'
import { defaultProcessValues } from '../common'
import CensusCreation, { formatGroupOptionLabel } from './CensusCreation'

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
        <CensusCreation showExtraMethods={false} />
      </FormProvider>
    </TestMemoryRouter>
  )
}

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
