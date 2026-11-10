import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, mockUseOrganization } from '~src/test-utils'
import { setReactProvidersMock, resetReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { LuCircleAlert } from 'react-icons/lu'
import type { ErrorSpec } from './errorSpec'
import { ErrorBlock } from './ErrorBlock'

const makeSpec = (overrides: Partial<ErrorSpec> = {}): ErrorSpec => ({
  icon: LuCircleAlert,
  title: 'Something went wrong',
  sentence: 'Try again in a few minutes.',
  primary: null,
  ...overrides,
})

const renderBlock = (spec: ErrorSpec, props: { reference?: string; hasHolderData?: boolean } = {}) =>
  render(
    <ErrorBlock spec={spec} headingRef={createRef()} reference={props.reference} hasHolderData={props.hasHolderData} />,
    { appEnv: { ENABLE_CERTIFICATE_AUTH: 'on' } }
  )

afterEach(() => {
  resetReactProvidersMock()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('ErrorBlock', () => {
  it('renders a level-2 heading with the spec title', () => {
    const { getByRole } = renderBlock(makeSpec({ title: 'Test title' }))
    expect(getByRole('heading', { level: 2, name: 'Test title' })).toBeInTheDocument()
  })

  it('renders the spec sentence', () => {
    const { getByText } = renderBlock(makeSpec({ sentence: 'The error sentence.' }))
    expect(getByText('The error sentence.')).toBeInTheDocument()
  })

  it('renders the help line "If you keep having problems, contact Acme." as plain text', () => {
    setReactProvidersMock({
      useOrganization: () => mockUseOrganization({ organization: { name: { default: 'Acme' } } }),
    })
    const { getByText, queryByRole } = renderBlock(makeSpec())
    const help = getByText(/If you keep having problems, contact Acme\./)
    expect(help).toBeInTheDocument()
    // No link element around the org name — plain text only
    expect(queryByRole('link', { name: /Acme/i })).toBeNull()
  })

  it('omits the help line when the organization has no name', () => {
    setReactProvidersMock({ useOrganization: () => mockUseOrganization({ organization: null }) })
    const { queryByText } = renderBlock(makeSpec())
    expect(queryByText(/If you keep having problems/)).toBeNull()
  })

  it('renders reference line when reference is given', () => {
    const { getByText } = renderBlock(makeSpec(), { reference: '3f9a07c2e41b8d5c2a6f90b3c7e14d28' })
    expect(getByText(/3F9A/)).toBeInTheDocument()
    expect(getByText(/07C2/)).toBeInTheDocument()
    expect(getByText(/E41B/)).toBeInTheDocument()
  })

  it('omits reference line when reference is absent', () => {
    const { queryByText } = renderBlock(makeSpec())
    expect(queryByText(/Reference code/)).toBeNull()
  })

  it('the panel has no role="alert"', () => {
    const { container } = renderBlock(makeSpec())
    expect(container.querySelector('[role="alert"]')).toBeNull()
  })

  it('holder text sits inside .ph-no-capture when hasHolderData is true', () => {
    const { container } = renderBlock(makeSpec({ sentence: 'Maria García López' }), { hasHolderData: true })
    const noCapture = container.querySelector('.ph-no-capture')
    expect(noCapture).not.toBeNull()
    expect(noCapture).toHaveTextContent('Maria García López')
  })

  it('no .ph-no-capture when hasHolderData is false', () => {
    const { container } = renderBlock(makeSpec({ sentence: 'Generic sentence.' }))
    expect(container.querySelector('.ph-no-capture')).toBeNull()
  })

  describe('ReferenceLine Copy button', () => {
    it('Copy writes the compact lower-case id to the clipboard and shows "Copied" with sr-only text', async () => {
      // userEvent.setup() installs its own clipboard stub on window.navigator.clipboard
      const user = userEvent.setup()
      const { getByRole, findByText } = renderBlock(makeSpec(), {
        reference: '3f9a07c2e41b8d5c2a6f90b3c7e14d28',
      })
      await user.click(getByRole('button', { name: /copy/i }))
      // Verify what was written to the clipboard via user-event's stub readText
      const written = await navigator.clipboard.readText()
      expect(written).toBe('3f9a07c2e41b')
      await findByText('Copied')
      // The VisuallyHidden sr-only confirmation is in the DOM
      expect(getByRole('status')).toHaveTextContent('Reference code copied')
    })

    it('shows error message on a rejected clipboard write', async () => {
      const user = userEvent.setup()
      // After user-event installs its clipboard stub, replace writeText with one that rejects.
      // We need to trigger setup first by doing a no-op interaction, then patch the stub.
      const { getByRole, findByText } = renderBlock(makeSpec(), {
        reference: '3f9a07c2e41b8d5c2a6f90b3c7e14d28',
      })
      // Patch the clipboard that user-event already set up
      navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error('denied'))
      await user.click(getByRole('button', { name: /copy/i }))
      await findByText("Couldn't copy. Select the code and copy it.")
    })

    it('pushes certificate_reference to window.$crisp when present', () => {
      const crisp: unknown[] = []
      vi.stubGlobal('$crisp', crisp)
      renderBlock(makeSpec(), { reference: '3f9a07c2e41b8d5c2a6f90b3c7e14d28' })
      expect(crisp).toEqual([['set', 'session:data', [[['certificate_reference', '3f9a07c2e41b']]]]])
    })
  })
})
