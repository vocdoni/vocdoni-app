import { createTestI18n, render, screen, TestMemoryRouter } from '~src/test-utils'
import PublicLayout from './PublicLayout'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: false, logout: vi.fn() }),
}))

vi.mock('~components/Layout/CrispChat', () => ({ default: () => null }))

const organizationLogo = { src: 'https://cdn/acme.png', name: 'Acme' }

const renderLayout = async (appEnv?: { SHOW_ORG_LOGO?: boolean }) => {
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
      <PublicLayout pathname='/en/processes/abc' organizationLogo={organizationLogo}>
        <div>content</div>
      </PublicLayout>
    </TestMemoryRouter>,
    { i18nInstance, appEnv }
  )
}

describe('PublicLayout', () => {
  it('keeps the Vocdoni logo in the header while SHOW_ORG_LOGO is off', async () => {
    await renderLayout()

    expect(screen.getAllByAltText('vocdoni icon').length).toBeGreaterThan(0)
    expect(screen.queryByAltText('Acme logo')).toBeNull()
  })

  it('shows the organization logo in the header when SHOW_ORG_LOGO is on', async () => {
    await renderLayout({ SHOW_ORG_LOGO: true })

    expect(screen.getByAltText('Acme logo')).toHaveAttribute('src', 'https://cdn/acme.png')
    expect(screen.queryByAltText('vocdoni icon')).toBeNull()
  })

  // The org logo brands the header only: the footer credits the platform, so it
  // must keep saying Vocdoni however the deployment is branded.
  it('keeps the Vocdoni logo in the footer either way', async () => {
    const { unmount } = await renderLayout({ SHOW_ORG_LOGO: true })
    expect(screen.getByAltText('Vocdoni logo')).toBeInTheDocument()
    unmount()

    await renderLayout()
    expect(screen.getByAltText('Vocdoni logo')).toBeInTheDocument()
  })
})
