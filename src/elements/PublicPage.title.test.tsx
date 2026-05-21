import { PublishedElection } from '@vocdoni/sdk'
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

const publicLayout = vi.fn(({ children }: { children: React.ReactNode }) => <>{children}</>)

vi.mock('~elements/PublicLayout', () => ({
  default: (props: {
    children: React.ReactNode
    hideAuthButton?: boolean
    authenticatedLabel?: { label?: string; value: string }
  }) => publicLayout(props),
}))

vi.mock('~components/Layout/LegalNotice', () => ({
  default: () => <div>legal-notice</div>,
}))

vi.mock('@vocdoni/react-components', () => ({
  OrganizationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ElectionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  reactComponentsNamespace: 'react-components',
  reactComponentsResources: {
    en: {},
    es: {},
    ca: {},
    it: {},
  },
  useOrganization: () => ({
    organization: {
      account: {
        name: {
          default: 'Acme Org',
        },
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
        organization={{ address: '0xabc', account: { name: { default: 'Acme Org' } } } as any}
        initialElectionsPage={{ items: [] } as any}
      />
    )

    expect(screen.getByText('organization-view-0')).toBeInTheDocument()
    expect(document.title).toBe('Initial title')
  })

  it('does not mutate document.title when rendering the process SSR page', () => {
    document.title = 'Initial title'
    publicLayout.mockClear()

    render(
      <PublicProcessPage
        election={new PublishedElection({} as any)}
        organization={{ address: '0xabc' } as any}
        pathname='/en/processes/0xabc'
      />
    )

    expect(screen.getByText('process-view')).toBeInTheDocument()
    expect(screen.getByText('legal-notice')).toBeInTheDocument()
    expect(publicLayout).toHaveBeenCalledWith(expect.objectContaining({ hideAuthButton: true }))
    expect(document.title).toBe('Initial title')
  })
})
