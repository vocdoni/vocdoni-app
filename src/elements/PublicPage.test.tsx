import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import PublicOrganizationPage from './organization/PublicPage'
import PublicProcessPage from './processes/PublicPage'
import PublicProcessSummaryView from './processes/PublicSummary'

const providerProps = vi.hoisted(() => ({ organization: vi.fn(), voter: vi.fn() }))

vi.mock('~components/Organization/View', () => ({
  default: ({ initialElectionsPage }: { initialElectionsPage?: { items?: unknown[] } }) => (
    <div>organization-view-{initialElectionsPage?.items?.length ?? 0}</div>
  ),
}))

vi.mock('~components/Process/voter/VoterPage', () => ({
  VoterPage: (props: Record<string, unknown>) => {
    providerProps.voter(props)
    return <div>voter-page</div>
  },
}))

vi.mock('~components/Process/Summary', () => ({
  ProcessSummary: () => <div>process-summary</div>,
}))

vi.mock('~components/Layout/LegalNotice', () => ({
  default: () => <div>legal-notice</div>,
}))

vi.mock('@vocdoni/react-components', () => ({
  OrganizationProvider: ({ children, ...props }: { children: React.ReactNode }) => {
    providerProps.organization(props)
    return <>{children}</>
  },
  ElectionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useOrganization: () => ({
    organization: {
      name: {
        default: 'Acme Org',
      },
      address: '0xabc',
    },
  }),
  useElection: () => ({
    election: {
      title: {
        default: 'Election title',
      },
    },
  }),
}))

describe('SSR public page wrappers', () => {
  it('hands the SSR elections page to the organization view', () => {
    render(
      <PublicOrganizationPage
        organization={{ address: '0xabc', name: { default: 'Acme Org' } } as any}
        initialElectionsPage={{ items: [{}, {}] } as any}
      />
    )

    expect(screen.getByText('organization-view-2')).toBeInTheDocument()
  })

  it('renders the voter page with the server data, the brand and the language links', () => {
    const election = { id: '0x0', orgAddress: 'abc' } as any
    const brand = { branded: true, name: 'Acme Org', logo: 'https://cdn.example/acme.svg' }
    const links = { en: '/en/processes/0x0', ca: '/ca/processes/0x0' }
    render(
      <PublicProcessPage
        id='0x0'
        election={election}
        organization={{ address: '0xabc' } as any}
        brand={brand}
        publicLanguageLinks={links}
      />
    )

    expect(screen.getByText('voter-page')).toBeInTheDocument()
    expect(providerProps.voter).toHaveBeenCalledWith(
      expect.objectContaining({ id: '0x0', election, brand, publicLanguageLinks: links })
    )
  })

  it('names the voter page after the organisation when the page data carries no brand', () => {
    providerProps.voter.mockClear()
    render(
      <PublicProcessPage
        id='0x0'
        election={{ id: '0x0', orgAddress: 'abc' } as any}
        organization={{ address: '0xabc', name: { default: 'Acme Org' } } as any}
      />
    )

    expect(providerProps.voter).toHaveBeenCalledWith(
      expect.objectContaining({ brand: { branded: false, name: 'Acme Org' } })
    )
  })

  // The organisation the server loaded seeds the provider, so its name and logo render without a fetch.
  it.each([
    ['process', PublicProcessPage],
    ['summary', PublicProcessSummaryView],
  ])('seeds the organization provider of the %s view with the server data', (_name, View) => {
    providerProps.organization.mockClear()
    const organization = { address: '0xabc', name: { default: 'Acme Org' } } as any

    render(<View id='0x0' election={{ id: '0x0', orgAddress: 'abc' } as any} organization={organization} />)

    expect(providerProps.organization).toHaveBeenCalledWith(expect.objectContaining({ organization }))
  })
})
