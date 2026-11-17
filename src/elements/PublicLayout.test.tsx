import { createTestI18n, render, screen, TestMemoryRouter } from '~src/test-utils'
import PublicLayout from './PublicLayout'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: false, logout: vi.fn() }),
}))

vi.mock('~components/Layout/CrispChat', () => ({ default: () => null }))

const organizationLogo = { src: 'https://cdn/acme.png', name: 'Acme' }

const renderLayout = async (logo?: typeof organizationLogo) => {
  const i18nInstance = await createTestI18n({
    useReactI18next: true,
    resources: {
      en: {
        common: {
          'alt.images.org_logo': '{{org}} logo',
          vocdoni_logo: 'Vocdoni logo',
        },
      },
    },
  })

  return render(
    <TestMemoryRouter>
      <PublicLayout pathname='/en/processes/abc' organizationLogo={logo}>
        <div>content</div>
      </PublicLayout>
    </TestMemoryRouter>,
    { i18nInstance }
  )
}

// Whether a process page shows its organisation's logo is decided by its brand, on the server (resolveProcessBrand);
// the layout shows whatever logo it is given.
describe('PublicLayout', () => {
  it('keeps the Vocdoni logo in the header without an organisation logo', async () => {
    await renderLayout()

    // Desktop and mobile variants, one hidden by CSS at any width.
    expect(screen.getAllByRole('img', { name: 'Vocdoni logo', hidden: true }).length).toBeGreaterThanOrEqual(2)
    expect(screen.queryByAltText('Acme logo')).toBeNull()
  })

  it('shows the organisation logo it is given, whatever SHOW_ORG_LOGO says', async () => {
    await renderLayout(organizationLogo)

    expect(screen.getByAltText('Acme logo')).toHaveAttribute('src', 'https://cdn/acme.png')
  })

  // The org logo brands the header only: the footer credits the platform, so it
  // must keep saying Vocdoni however the page is branded.
  it('keeps the Vocdoni logo in the footer either way', async () => {
    const { unmount } = await renderLayout(organizationLogo)
    expect(screen.getByRole('img', { name: 'Vocdoni logo' })).toBeInTheDocument()
    unmount()

    await renderLayout()
    // Header (one visible variant) plus footer.
    expect(screen.getAllByRole('img', { name: 'Vocdoni logo' }).length).toBeGreaterThanOrEqual(2)
  })
})
