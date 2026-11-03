import type { ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { AllProviders, createTestI18n, fireEvent, render, screen, TestMemoryRouter } from '~src/test-utils'
import Logo, { VocdoniLogo } from './Logo'

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

  // The <img> ships in the server-rendered markup, so a broken URL can fail
  // before React hydrates: that error event fires with no listener attached and
  // never reaches onError, which would leave a broken image in the header for
  // good. jsdom never loads images, so stub the "already settled, nothing
  // decoded" state a browser reports after such a failure and assert the load is
  // replayed — that replay is what lets onError fire at all in this case.
  it('replays an image load that already settled before hydration', async () => {
    const setAttribute = vi.spyOn(HTMLImageElement.prototype, 'setAttribute')
    const srcWrites = () => setAttribute.mock.calls.filter(([name]) => name === 'src').length
    const organization = { src: 'https://cdn/broken.png', name: 'Acme' }

    try {
      const { unmount } = await renderLogo(<Logo organization={organization} />)
      const baseline = srcWrites()
      unmount()
      setAttribute.mockClear()

      vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
      await renderLogo(<Logo organization={organization} />)

      expect(srcWrites()).toBe(baseline + 1)
    } finally {
      vi.restoreAllMocks()
    }
  })

  // next-themes sets the `dark` class on <html> before the server-rendered markup paints, while a
  // JS colour value only switches after hydration. Flip the class without telling React: only a
  // CSS-driven logo follows it.
  it('takes its dark-mode colours from the html class, not from JS', async () => {
    const { container } = await renderLogo(
      <>
        <Logo />
        <VocdoniLogo data-testid='vocdoni-svg' />
      </>
    )
    const wrappers = [...container.querySelectorAll('a > div')]
    const svg = screen.getByTestId('vocdoni-svg')

    try {
      document.documentElement.classList.remove('dark')
      wrappers.forEach((el) => expect(getComputedStyle(el).filter).not.toBe('invert(100%)'))
      document.documentElement.classList.add('dark')
      expect(wrappers).toHaveLength(2)
      wrappers.forEach((el) => expect(getComputedStyle(el).filter).toBe('invert(100%)'))
    } finally {
      document.documentElement.classList.remove('dark')
    }
    svg.querySelectorAll('path').forEach((path) => expect(path).toHaveAttribute('fill', 'currentColor'))
  })

  it('puts the organization logo on a light tile in dark mode only', async () => {
    await renderLogo(<Logo organization={{ src: 'https://cdn/acme.png', name: 'Acme' }} />)
    const logo = screen.getByAltText('Acme logo')

    try {
      document.documentElement.classList.remove('dark')
      expect(getComputedStyle(logo).backgroundColor).not.toContain('auth-logo-tile-bg')
      document.documentElement.classList.add('dark')
      expect(getComputedStyle(logo).backgroundColor).toBe('var(--chakra-colors-auth-logo-tile-bg)')
    } finally {
      document.documentElement.classList.remove('dark')
    }
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
