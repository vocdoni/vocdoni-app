import { fireEvent, render, screen } from '~src/test-utils'
import type { ReactElement } from 'react'
import { vi } from 'vitest'
import { ElectionContext } from '@vocdoni/react-components'
import { useForm } from 'react-hook-form'
import { processSpreadsheetIdentifierStorageKey } from '~components/Process/authenticatedVoterLabel'
import { electionComponents } from './election'

const SpreadsheetAccess = electionComponents.SpreadsheetAccess!

describe('electionComponents.SpreadsheetAccess', () => {
  const renderWithElection = (ui: ReactElement) =>
    render(<ElectionContext.Provider value={{ election: { id: 'process-1' } } as any}>{ui}</ElectionContext.Provider>)

  it('binds visible input to provided field inputProps', () => {
    const onChange = vi.fn()
    const onBlur = vi.fn()
    const ref = vi.fn()

    renderWithElection(
      <SpreadsheetAccess
        connected={false}
        loading={false}
        title='Spreadsheet access'
        open={true}
        onOpen={() => {}}
        onClose={() => {}}
        onLogout={() => {}}
        onSubmit={() => {}}
        fields={[
          {
            id: '0',
            label: 'Code',
            inputProps: { name: '0', onChange: async () => onChange(), onBlur: async () => onBlur(), ref },
            inputAttrs: { type: 'text' },
          },
        ]}
      />
    )

    fireEvent.change(screen.getByLabelText('Code'), { target: { value: '123' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('renders anonymous field helper and error states', async () => {
    const { rerender } = render(
      <SpreadsheetAccess
        connected={false}
        loading={false}
        title='Spreadsheet access'
        open={true}
        onOpen={() => {}}
        onClose={() => {}}
        onLogout={() => {}}
        onSubmit={() => {}}
        fields={[]}
        anonymousField={{
          id: 'sik_password',
          label: 'Anon password',
          description: 'Helper',
          inputProps: { name: 'sik_password', onChange: async () => {}, onBlur: async () => {}, ref: () => {} },
          inputAttrs: { type: 'password' },
        }}
      />
    )

    expect(await screen.findByText('Helper')).toBeInTheDocument()

    rerender(
      <SpreadsheetAccess
        connected={false}
        loading={false}
        title='Spreadsheet access'
        open={true}
        onOpen={() => {}}
        onClose={() => {}}
        onLogout={() => {}}
        onSubmit={() => {}}
        fields={[]}
        anonymousField={{
          id: 'sik_password',
          label: 'Anon password',
          error: 'validation.required',
          inputProps: { name: 'sik_password', onChange: async () => {}, onBlur: async () => {}, ref: () => {} },
          inputAttrs: { type: 'password' },
        }}
      />
    )

    expect(await screen.findByText('validation.required')).toBeInTheDocument()
  })

  it('shows react-hook-form required error in modal fields', async () => {
    const Harness = () => {
      const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm<{ code: string }>()

      return (
        <SpreadsheetAccess
          connected={false}
          loading={false}
          title='Spreadsheet access'
          open={true}
          onOpen={() => {}}
          onClose={() => {}}
          onLogout={() => {}}
          onSubmit={handleSubmit(() => {}) as unknown as () => void}
          fields={[
            {
              id: 'code',
              label: 'Code',
              error: errors.code?.message as string | undefined,
              inputProps: register('code', { required: 'validation.required' }),
              inputAttrs: { type: 'text' },
            },
          ]}
        />
      )
    }

    render(<Harness />)
    fireEvent.click(screen.getAllByRole('button', { name: 'spreadsheet.access_button' })[1])

    expect(await screen.findByText('validation.required')).toBeInTheDocument()
  })

  it('persists the spreadsheet identifier only after the connection succeeds', async () => {
    const onSubmit = vi.fn()

    const { rerender } = renderWithElection(
      <SpreadsheetAccess
        connected={false}
        loading={false}
        title='Spreadsheet access'
        open={true}
        onOpen={() => {}}
        onClose={() => {}}
        onLogout={() => {}}
        onSubmit={onSubmit}
        fields={[
          {
            id: 'code',
            label: 'Code',
            inputProps: { name: 'code', onChange: async () => {}, onBlur: async () => {}, ref: () => {} },
            inputAttrs: { type: 'text' },
          },
        ]}
      />
    )

    fireEvent.change(screen.getByLabelText('Code'), { target: { value: '  Katleen  ' } })
    fireEvent.click(screen.getAllByRole('button', { name: 'spreadsheet.access_button' })[1])

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(window.localStorage.getItem(processSpreadsheetIdentifierStorageKey('process-1'))).toBeNull()

    rerender(
      <ElectionContext.Provider value={{ election: { id: 'process-1' } } as any}>
        <SpreadsheetAccess
          connected={true}
          loading={false}
          title='Spreadsheet access'
          open={true}
          onOpen={() => {}}
          onClose={() => {}}
          onLogout={() => {}}
          onSubmit={onSubmit}
          fields={[
            {
              id: 'code',
              label: 'Code',
              inputProps: { name: 'code', onChange: async () => {}, onBlur: async () => {}, ref: () => {} },
              inputAttrs: { type: 'text' },
            },
          ]}
        />
      </ElectionContext.Provider>
    )

    expect(window.localStorage.getItem(processSpreadsheetIdentifierStorageKey('process-1'))).toBe(
      JSON.stringify({ label: 'Code', value: 'Katleen' })
    )
  })
})
