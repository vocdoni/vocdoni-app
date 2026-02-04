import i18n from 'i18next'
import { FormProvider, useForm } from 'react-hook-form'
import { MemoryRouter } from 'react-router-dom'
import { render } from '~src/test-utils'
import { defaultProcessValues } from '../common'
import CensusCreation from './CensusCreation'

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
    <MemoryRouter>
      <FormProvider {...methods}>
        <CensusCreation showExtraMethods={false} />
      </FormProvider>
    </MemoryRouter>
  )
}

describe('CensusCreation', () => {
  it('renders group empty state without crashing', () => {
    i18n.addResource(
      'en',
      'translation',
      'process_create.census.group.no_groups',
      'To start a vote, you first need to create a group of eligible voters from your memberbase. <0/>.'
    )
    expect(() => render(<CensusCreationHarness />)).not.toThrow()
  })
})
