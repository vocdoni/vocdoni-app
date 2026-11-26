import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import PublicOrganizationPage from './organization/PublicPage'
import PublicProcessPage from './processes/PublicPage'
import PublicProcessSummaryView from './processes/PublicSummary'

const providerProps = vi.hoisted(() => ({ organization: vi.fn(), election: vi.fn(), voter: vi.fn() }))

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
  ElectionProvider: ({ children, ...props }: { children: React.ReactNode }) => {
    providerProps.election(props)
    return <>{children}</>
  },
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
        fetchedAt={1_700_000_000_000}
        initialElectionsPage={{ items: [{}, {}] } as any}
      />
    )

    expect(screen.getByText('organization-view-2')).toBeInTheDocument()
    expect(providerProps.organization.mock.calls.at(-1)?.[0].queryOptions.staleTime).toBeGreaterThan(0)
    expect(providerProps.organization.mock.calls.at(-1)?.[0].queryOptions.initialDataUpdatedAt).toBe(1_700_000_000_000)
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

  it('seeds the organization provider of the voter page and hands it the server fetch time', () => {
    providerProps.organization.mockClear()
    providerProps.voter.mockClear()
    const election = { id: '0x0', orgAddress: 'abc' } as any
    const organization = { address: '0xabc' } as any

    render(<PublicProcessPage id='0x0' election={election} organization={organization} fetchedAt={1_700_000_000_000} />)

    const org = providerProps.organization.mock.calls[0][0]
    expect(org.organization).toBe(organization)
    expect(org.queryOptions.staleTime).toBeGreaterThan(0)
    // Dated from the server fetch, so HTML served from the SSR cache is refetched once it is stale.
    expect(org.queryOptions.initialDataUpdatedAt).toBe(1_700_000_000_000)
    expect(providerProps.voter).toHaveBeenCalledWith(
      expect.objectContaining({ election, fetchedAt: 1_700_000_000_000 })
    )
  })

  describe('summary view prefetched data', () => {
    beforeEach(() => {
      providerProps.organization.mockClear()
      providerProps.election.mockClear()
    })

    it('seeds both providers with the server data and trusts it before refetching', () => {
      const election = { id: '0x0', orgAddress: 'abc' } as any
      const organization = { address: '0xabc' } as any

      render(
        <PublicProcessSummaryView
          id='0x0'
          election={election}
          organization={organization}
          fetchedAt={1_700_000_000_000}
        />
      )

      const org = providerProps.organization.mock.calls[0][0]
      expect(org.organization).toBe(organization)
      expect(org.queryOptions.staleTime).toBeGreaterThan(0)
      // Dated from the server fetch, so HTML served from the SSR cache is refetched once it is stale.
      expect(org.queryOptions.initialDataUpdatedAt).toBe(1_700_000_000_000)

      const el = providerProps.election.mock.calls[0][0]
      expect(el.election).toBe(election)
      expect(el.queryOptions).toMatchObject({
        refetchInterval: 30_000,
        staleTime: 30_000,
        initialDataUpdatedAt: 1_700_000_000_000,
      })
    })
  })
})
