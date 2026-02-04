import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { render, screen } from '~src/test-utils'
import { IssueTypeSelector, MembershipSizeSelector, OrganizationTypeSelector } from './SaasSelector'

const mockedOrganizationTypes = vi.hoisted(() => [
  { name: 'Non-profit', type: 'non-profit' },
  { name: 'Company', type: 'company' },
])

vi.mock('~src/queries/organization', () => ({
  useOrganizationTypes: () => ({
    data: mockedOrganizationTypes,
    isLoading: false,
    isError: false,
  }),
  useRoles: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
}))

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return ''
  }
  if (typeof value === 'string') {
    return `string:${value}`
  }
  if (typeof value === 'object' && 'value' in (value as { value?: string })) {
    return `object:${(value as { value?: string }).value ?? ''}`
  }
  return 'object'
}

const ValuePreview = ({ name }: { name: string }) => {
  const { watch } = useFormContext()
  const value = watch(name)

  return <div data-testid='value'>{formatValue(value)}</div>
}

const MembershipForm = () => {
  const methods = useForm<{ size: string }>({
    defaultValues: {
      size: '0-100',
    },
  })

  return (
    <FormProvider {...methods}>
      <MembershipSizeSelector name='size' />
      <ValuePreview name='size' />
    </FormProvider>
  )
}

describe('MembershipSizeSelector', () => {
  it('stores the selected option value as a string', async () => {
    const user = userEvent.setup()
    render(<MembershipForm />)

    expect(screen.getByTestId('value')).toHaveTextContent('string:0-100')

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByText('101-1000'))

    expect(screen.getByTestId('value')).toHaveTextContent('string:101-1000')
  })
})

const OrganizationTypeForm = () => {
  const methods = useForm<{ type: string }>({
    defaultValues: {
      type: 'company',
    },
  })

  return (
    <FormProvider {...methods}>
      <OrganizationTypeSelector name='type' />
      <ValuePreview name='type' />
    </FormProvider>
  )
}

describe('OrganizationTypeSelector', () => {
  it('stores the selected option value as a string', async () => {
    const user = userEvent.setup()
    render(<OrganizationTypeForm />)

    expect(screen.getByTestId('value')).toHaveTextContent('string:company')

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByText('Non-profit'))

    expect(screen.getByTestId('value')).toHaveTextContent('string:non-profit')
  })
})

const IssueTypeForm = () => {
  const methods = useForm<{ issue: unknown }>({
    defaultValues: {
      issue: '',
    },
  })

  return (
    <FormProvider {...methods}>
      <IssueTypeSelector name='issue' />
      <ValuePreview name='issue' />
    </FormProvider>
  )
}

describe('IssueTypeSelector', () => {
  it('stores the selected option as an object by default', async () => {
    const user = userEvent.setup()
    render(<IssueTypeForm />)

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByText('Billing issue'))

    expect(screen.getByTestId('value')).toHaveTextContent('object:billing-issue')
  })
})
