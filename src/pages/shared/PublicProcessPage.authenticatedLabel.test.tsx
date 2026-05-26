import { render } from '@testing-library/react'

let currentData: any
let currentPageContext: any
const publicLayout = vi.fn(({ children }: { children: React.ReactNode }) => <>{children}</>)

vi.mock('vike-react/useData', () => ({
  useData: () => currentData,
}))

vi.mock('vike-react/usePageContext', () => ({
  usePageContext: () => currentPageContext,
}))

vi.mock('~src/Providers', () => ({
  AppProviders: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('~elements/PublicLayout', () => ({
  default: (props: {
    children: React.ReactNode
    pathname: string
    authenticatedLabel?: { label?: string; value: string }
  }) => publicLayout(props),
}))

vi.mock('~elements/processes/PublicPage', () => ({
  default: () => <div>process-page</div>,
}))

vi.mock('~src/pages/shared/publicPageRedirect', () => ({
  usePreferredPublicLanguageRedirect: vi.fn(),
}))

describe('PublicProcessPage authenticated label', () => {
  beforeEach(() => {
    currentData = {
      id: '0xprocess',
      election: { id: '0xprocess', census: { type: 'csp' }, meta: { census: { type: 'csp' } } },
      organization: { address: '0xabc' },
      meta: {
        language: 'en',
        alternates: [{ hrefLang: 'en', href: 'http://localhost:3000/en/processes/0xprocess' }],
      },
    }
    currentPageContext = { urlPathname: '/en/processes/0xprocess' }
    window.localStorage.clear()
    publicLayout.mockClear()
  })

  it('keeps the label when the public language path changes', async () => {
    window.localStorage.setItem(
      'process-csp-identifier:0xprocess',
      JSON.stringify({ label: 'Nombre', value: 'Katleen' })
    )

    const { default: PublicProcessPage } = await import('./PublicProcessPage')

    const { rerender } = render(<PublicProcessPage />)

    expect(publicLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        authenticatedLabel: { label: 'Nombre', value: 'Katleen' },
      })
    )

    currentPageContext = { urlPathname: '/ca/processes/0xprocess' }
    rerender(<PublicProcessPage />)

    expect(publicLayout).toHaveBeenLastCalledWith(
      expect.objectContaining({
        authenticatedLabel: { label: 'Nombre', value: 'Katleen' },
      })
    )
  })
})
