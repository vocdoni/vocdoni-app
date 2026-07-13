import { Input } from '@chakra-ui/react'
import { render, screen } from '~src/test-utils'
import { Field } from './Field'

describe('Field', () => {
  it('renders a label, the control and helper text', () => {
    render(
      <Field label='Email' helperText="We'll never share it">
        <Input />
      </Field>
    )

    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByText("We'll never share it")).toBeInTheDocument()
  })

  it('shows error text only when invalid', () => {
    const { rerender } = render(
      <Field label='Email' errorText='Required'>
        <Input />
      </Field>
    )
    expect(screen.queryByText('Required')).not.toBeInTheDocument()

    rerender(
      <Field label='Email' invalid errorText='Required'>
        <Input />
      </Field>
    )
    expect(screen.getByText('Required')).toBeInTheDocument()
  })
})
