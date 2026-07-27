import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import PublicOrganizationPage from './organization/PublicPage'
import PublicProcessPage from './processes/PublicPage'

vi.mock('~components/Organization/View', () => ({
  default: ({ initialElectionsPage }: { initialElectionsPage?: { items?: unknown[] } }) => (
    <div>organization-view-{initialElectionsPage?.items?.length ?? 0}</div>
  ),
}))

vi.mock('~components/Process/View', () => ({
  ProcessView: () => <div>process-view</div>,
}))

vi.mock('~components/Layout/LegalNotice', () => ({
  default: () => <div>legal-notice</div>,
}))

vi.mock('@vocdoni/react-components', () => ({
  OrganizationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ElectionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ProcessProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

describe('SSR public pages title handling', () => {
  it('does not mutate document.title when rendering the organization SSR page', () => {
    document.title = 'Initial title'

    render(
      <PublicOrganizationPage
        organization={{ address: '0xabc', name: { default: 'Acme Org' } } as any}
        initialElectionsPage={{ items: [] } as any}
      />
    )

    expect(screen.getByText('organization-view-0')).toBeInTheDocument()
    expect(document.title).toBe('Initial title')
  })

  it('does not mutate document.title when rendering the process SSR page', () => {
    document.title = 'Initial title'

    render(
      <PublicProcessPage id='0x0' election={{ id: '0x0', orgAddress: 'abc' } as any} organizationAddress='0xabc' />
    )

    expect(screen.getByText('process-view')).toBeInTheDocument()
    expect(screen.getByText('legal-notice')).toBeInTheDocument()
    expect(document.title).toBe('Initial title')
  })
})
