import { fireEvent, render, screen } from '~src/test-utils'
import { vi } from 'vitest'
import { electionComponents } from './election'

const SpreadsheetAccess = electionComponents.SpreadsheetAccess!

describe('electionComponents.SpreadsheetAccess', () => {
  it('binds visible input to provided field inputProps', () => {
    const onChange = vi.fn()
    const onBlur = vi.fn()
    const ref = vi.fn()

    render(
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
})
