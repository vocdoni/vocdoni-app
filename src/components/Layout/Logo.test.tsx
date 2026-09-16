import type { ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { AllProviders, createTestI18n, fireEvent, render, screen, TestMemoryRouter } from '~src/test-utils'
import Logo from './Logo'

const i18n = () =>
  createTestI18n({
    useReactI18next: true,
    resources: {
      en: {
        common: {
          'alt.images.org_logo': '{{org}} logo',
          'alt.images.organization_logo': 'Organization logo',
        },
      },
    },
  })

const renderLogo = async (ui: ReactElement) =>
  render(<TestMemoryRouter>{ui}</TestMemoryRouter>, { i18nInstance: await i18n() })

describe('Logo', () => {
  // The Vocdoni logo ships as two <img>s (desktop + mobile) toggled by CSS, so
  // both share the same alt text.
  it('renders the Vocdoni logo when no organization logo is given', async () => {
    await renderLogo(<Logo />)

    expect(screen.getAllByAltText('vocdoni icon').length).toBeGreaterThan(0)
    expect(screen.queryByRole('img', { name: /Acme/ })).toBeNull()
  })

  it('renders the organization logo, named after the organization', async () => {
    await renderLogo(<Logo organization={{ src: 'https://cdn/acme.png', name: 'Acme' }} />)

    const logo = screen.getByAltText('Acme logo')
    expect(logo).toHaveAttribute('src', 'https://cdn/acme.png')
    // The Vocdoni logo must be gone, not merely hidden behind it.
    expect(screen.queryByAltText('vocdoni icon')).toBeNull()
  })

  it('falls back to a generic alt text when the organization has no name', async () => {
    await renderLogo(<Logo organization={{ src: 'https://cdn/acme.png' }} />)

    expect(screen.getByAltText('Organization logo')).toBeInTheDocument()
  })

  it('falls back to the Vocdoni logo when the organization logo fails to load', async () => {
    await renderLogo(<Logo organization={{ src: 'https://cdn/broken.png', name: 'Acme' }} />)

    fireEvent.error(screen.getByAltText('Acme logo'))

    expect(screen.getAllByAltText('vocdoni icon').length).toBeGreaterThan(0)
    expect(screen.queryByAltText('Acme logo')).toBeNull()
  })

  it('keeps linking to the app root', async () => {
    await renderLogo(<Logo organization={{ src: 'https://cdn/acme.png', name: 'Acme' }} />)

    expect(screen.getByRole('link')).toHaveAttribute('href', '/')
  })

  // The voting page is a Vike SSR page: the org logo must be in the markup the
  // server sends, not swapped in after hydration (which would flash the Vocdoni
  // logo first). Assert against the actual server render, not the jsdom one.
  it('server-renders the organization logo into the markup', async () => {
    const html = renderToString(
      <AllProviders i18nInstance={await i18n()}>
        <Logo organization={{ src: 'https://cdn/acme.png', name: 'Acme' }} />
      </AllProviders>
    )

    expect(html).toContain('https://cdn/acme.png')
    expect(html).toContain('Acme logo')
    expect(html).not.toContain('/assets/logo_vocdoni.png')
  })
})
