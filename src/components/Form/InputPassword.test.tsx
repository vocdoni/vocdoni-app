import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { render, screen } from '~src/test-utils'
import InputPassword from './InputPassword'

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({ defaultValues: { password: '' } })
  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('InputPassword', () => {
  it('reveals and hides the password through a focusable, named button', async () => {
    const user = userEvent.setup()
    render(
      <Wrapper>
        <InputPassword formValue='password' label='Password' />
      </Wrapper>
    )
    const input = document.querySelector<HTMLInputElement>('input[name="password"]')!

    expect(input).toHaveAttribute('type', 'password')
    await user.tab()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Show password' })).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(input).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(input).toHaveAttribute('type', 'password')
  })
})
