import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { AllProviders, createTestQueryClient, render } from '~src/test-utils'
import { getAuthMock, setAuthMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import type { CertificateCoverage } from '~src/queries/certificateAuth/warnings'
import { CertificateSteps } from './CertificateSteps'
import { createRef } from 'react'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => getAuthMock(),
}))

const cleanCoverage: CertificateCoverage = {
  cannotSignIn: 0,
  missing: [],
  invalid: [],
  duplicates: [],
  counts: { missing: 0, letter: 0, otherId: 0 },
}

const issuesCoverage: CertificateCoverage = {
  cannotSignIn: 24,
  missing: Array.from({ length: 18 }, (_, i) => `miss${i}`),
  invalid: Array.from({ length: 6 }, (_, i) => ({
    memberId: `inv${i}`,
    reason: (i < 3 ? 'letter' : 'not_dni') as 'letter' | 'not_dni',
  })),
  duplicates: [],
  counts: { missing: 18, letter: 3, otherId: 3 },
}

const dupCoverage: CertificateCoverage = {
  cannotSignIn: 18,
  missing: Array.from({ length: 18 }, (_, i) => `miss${i}`),
  invalid: [],
  duplicates: ['d1', 'd2'],
  counts: { missing: 18, letter: 0, otherId: 0 },
}

// Make a mock bearedFetch that returns member data for a list of ids.
const makeMemberFetch = (members: { id: string; name: string; surname: string; nationalId: string }[]) =>
  vi.fn().mockResolvedValue({
    members,
    pagination: { currentPage: 1, lastPage: 1, totalItems: members.length, previousPage: null, nextPage: null },
  })

const makeWrapper =
  (org = '0xorg') =>
  ({ children }: { children: ReactNode }) => (
    <AllProviders queryClient={createTestQueryClient()}>{children}</AllProviders>
  )

const defaultProps = {
  membersCount: 430,
  groupId: 'grp1',
  status: 'valid' as const,
  open: [],
  onToggle: vi.fn(),
  attempted: false,
  duplicatesToggleRef: createRef<HTMLButtonElement | null>(),
  onRetry: vi.fn(),
}

describe('CertificateSteps', () => {
  beforeEach(() => {
    setReactProvidersMock({ useOrganization: () => ({ organization: { address: '0xorg' } }) })
    setAuthMock({
      bearedFetch: vi.fn().mockResolvedValue({
        members: [],
        pagination: { currentPage: 1, lastPage: 1, totalItems: 0, previousPage: null, nextPage: null },
      }),
    })
  })

  it('shows clean coverage: "All 430 members can sign in." and "Every member has a valid DNI/NIE."', () => {
    render(<CertificateSteps {...defaultProps} coverage={cleanCoverage} />, {
      appEnv: { ENABLE_CERTIFICATE_AUTH: 'on' },
    })

    expect(screen.getByText('All 430 members can sign in.')).toBeInTheDocument()
    expect(screen.getByText('Every member has a valid DNI/NIE.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /can't sign in/i })).not.toBeInTheDocument()
  })

  it('shows issues coverage with correct message, body, link and collapsed buckets', () => {
    render(<CertificateSteps {...defaultProps} coverage={issuesCoverage} />, {
      appEnv: { ENABLE_CERTIFICATE_AUTH: 'on' },
    })

    expect(screen.getByText(/24 members are missing a valid DNI\/NIE and can't sign in\./)).toBeInTheDocument()
    expect(screen.getByText(/Fix their DNI\/NIE in your member list\./)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Review these 24' })).toHaveAttribute('href', '#members-to-review')

    const missingBtn = screen.getByRole('button', { name: /No DNI\/NIE: can't sign in/ })
    expect(missingBtn).toHaveAttribute('aria-expanded', 'false')
    const invalidBtn = screen.getByRole('button', { name: /Invalid DNI\/NIE: can't sign in/ })
    expect(invalidBtn).toHaveAttribute('aria-expanded', 'false')
  })

  it('opening the invalid bucket shows member names, stored value in mono, and reason', async () => {
    const user = userEvent.setup()
    const members = Array.from({ length: 6 }, (_, i) => ({
      id: `inv${i}`,
      name: `Name${i}`,
      surname: `Sur${i}`,
      nationalId: `1234567${i}A`,
    }))
    setAuthMock({ bearedFetch: makeMemberFetch(members) })

    const [openState, setOpenState] = [['invalid'], vi.fn()]
    render(<CertificateSteps {...defaultProps} coverage={issuesCoverage} open={['invalid']} onToggle={vi.fn()} />, {
      appEnv: { ENABLE_CERTIFICATE_AUTH: 'on' },
    })

    // Wait for member data to load
    await waitFor(() => expect(screen.queryByText('Loading these members…')).not.toBeInTheDocument())

    // Members whose reason is 'letter' (inv0-inv2)
    expect(screen.getAllByText("Letter doesn't match").length).toBeGreaterThan(0)
    // Members whose reason is 'not_dni' (inv3-inv5)
    expect(screen.getAllByText('Not a DNI or NIE').length).toBeGreaterThan(0)
  })

  it('more than 6 invalid members shows 4 rows and "and N more in the CSV"', async () => {
    const bigInvalidCoverage: CertificateCoverage = {
      cannotSignIn: 8,
      missing: [],
      invalid: Array.from({ length: 8 }, (_, i) => ({ memberId: `inv${i}`, reason: 'letter' as const })),
      duplicates: [],
      counts: { missing: 0, letter: 8, otherId: 0 },
    }
    const members = Array.from({ length: 8 }, (_, i) => ({
      id: `inv${i}`,
      name: `Name${i}`,
      surname: `Sur${i}`,
      nationalId: `1234567${i}A`,
    }))
    setAuthMock({ bearedFetch: makeMemberFetch(members) })

    render(<CertificateSteps {...defaultProps} coverage={bigInvalidCoverage} open={['invalid']} onToggle={vi.fn()} />, {
      appEnv: { ENABLE_CERTIFICATE_AUTH: 'on' },
    })

    await waitFor(() => expect(screen.queryByText('Loading these members…')).not.toBeInTheDocument())

    // Should show "and 4 more in the CSV" (8 - 4 = 4)
    expect(screen.getByText('and 4 more in the CSV')).toBeInTheDocument()
  })

  it('with duplicates: shows duplicate line first and "Same DNI/NIE on more than one member: fix to save" bucket first', () => {
    render(<CertificateSteps {...defaultProps} coverage={dupCoverage} />, { appEnv: { ENABLE_CERTIFICATE_AUTH: 'on' } })

    expect(screen.getByText(/2 members share the same DNI\/NIE, so they can't be told apart\./)).toBeInTheDocument()
    expect(screen.getByText(/Give each one their own DNI\/NIE in your member list\./)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Review these 2' })).toHaveAttribute('href', '#members-to-review')

    // The first bucket button should be the dup bucket
    const buttons = screen.getAllByRole('button', { name: /can't sign in|fix to save/i })
    expect(buttons[0]).toHaveAccessibleName(/Same DNI\/NIE on more than one member: fix to save/)
  })

  it('"Tell your members" shows exactly the two lines with no anonymity line', () => {
    render(<CertificateSteps {...defaultProps} coverage={cleanCoverage} />, {
      appEnv: { ENABLE_CERTIFICATE_AUTH: 'on' },
    })

    expect(screen.getByText('Voters need a certificate already installed.')).toBeInTheDocument()
    expect(screen.getByText("The idCAT Mòbil app and Cl@ve are not certificates and won't work.")).toBeInTheDocument()
    // No anonymity/ballot line
    expect(screen.queryByText(/anonymous/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/anonymity/i)).not.toBeInTheDocument()
  })

  it('the protection meter reads "Protection" and "Strong"', () => {
    render(<CertificateSteps {...defaultProps} coverage={cleanCoverage} />, {
      appEnv: { ENABLE_CERTIFICATE_AUTH: 'on' },
    })

    expect(screen.getByText('Protection')).toBeInTheDocument()
    expect(screen.getByText('Strong')).toBeInTheDocument()
  })
})
