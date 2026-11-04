import '@testing-library/jest-dom'
import { render, screen, within } from '~src/test-utils'
import type { CertificateCoverage } from '~src/queries/certificateAuth/warnings'
import { CertificateAuthSummary } from './CertificateAuthSummary'

const emptyCoverage = (): CertificateCoverage => ({
  cannotSignIn: 0,
  missing: [],
  invalid: [],
  duplicates: [],
  counts: { missing: 0, letter: 0, otherId: 0 },
})

const missingCoverage = (missingCount: number, total: number): CertificateCoverage => ({
  cannotSignIn: missingCount,
  missing: Array.from({ length: missingCount }, (_, i) => `m${i + 1}`),
  invalid: [],
  duplicates: [],
  counts: { missing: missingCount, letter: 0, otherId: 0 },
})

const mixedCoverage = (missing: number, letter: number, otherId: number): CertificateCoverage => {
  const total = missing + letter + otherId
  return {
    cannotSignIn: total,
    missing: Array.from({ length: missing }, (_, i) => `miss${i}`),
    invalid: [
      ...Array.from({ length: letter }, (_, i) => ({ memberId: `let${i}`, reason: 'letter' as const })),
      ...Array.from({ length: otherId }, (_, i) => ({ memberId: `oth${i}`, reason: 'not_dni' as const })),
    ],
    duplicates: [],
    counts: { missing, letter, otherId },
  }
}

describe('CertificateAuthSummary', () => {
  it('shows the method, strong badge, and covered verdict when all members can sign in', () => {
    render(<CertificateAuthSummary membersCount={430} status='valid' coverage={emptyCoverage()} />)

    expect(screen.getByText('Voter sign-in')).toBeInTheDocument()
    expect(screen.getByText('Strong')).toBeInTheDocument()
    expect(screen.getByText('Digital certificate (DNI/NIE)')).toBeInTheDocument()
    expect(screen.getByText('Matched to the DNI/NIE in your member list.')).toBeInTheDocument()
    expect(screen.getByText('All 430 members can sign in.')).toBeInTheDocument()
    // No ballot anonymity line in the certificate summary.
    expect(screen.queryByText(/ballot anonymity/i)).not.toBeInTheDocument()
  })

  it('shows a single missing notice when all problems are absent nationalIds', () => {
    render(<CertificateAuthSummary membersCount={430} status='valid' coverage={missingCoverage(24, 430)} />)

    expect(screen.getByText(/24 members are missing a DNI\/NIE, so they can't sign in\./)).toBeInTheDocument()
    expect(screen.getByText('The other 406 can.')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /fix your member list/i })
    expect(link).toHaveAttribute('target', '_blank')
    expect(within(link).getByText('(opens in a new tab)')).toBeInTheDocument()
  })

  it('shows a mixed list when missing, letter, and other-id problems are present', () => {
    render(<CertificateAuthSummary membersCount={430} status='valid' coverage={mixedCoverage(24, 4, 2)} />)

    expect(
      screen.getByText(/30 members have a missing or invalid DNI\/NIE, so they can't sign in:/)
    ).toBeInTheDocument()
    expect(screen.getByText(/24 have no DNI\/NIE/)).toBeInTheDocument()
    expect(screen.getByText(/4 have a letter that doesn't match the number/)).toBeInTheDocument()
    expect(screen.getByText(/2 have another kind of ID, like a passport/)).toBeInTheDocument()
    expect(screen.getByText('The other 400 can.')).toBeInTheDocument()
  })

  it('shows only non-zero lines in the mixed list when missing count is zero', () => {
    render(<CertificateAuthSummary membersCount={430} status='invalid' coverage={mixedCoverage(0, 4, 2)} />)

    expect(screen.getByText(/6 members have a missing or invalid DNI\/NIE, so they can't sign in:/)).toBeInTheDocument()
    expect(screen.queryByText(/have no DNI\/NIE/)).not.toBeInTheDocument()
    expect(screen.getByText(/4 have a letter that doesn't match the number/)).toBeInTheDocument()
    expect(screen.getByText(/2 have another kind of ID, like a passport/)).toBeInTheDocument()
  })

  it('shows the previous verdict dimmed and aria-busy while re-checking after a tab return', () => {
    render(
      <CertificateAuthSummary
        membersCount={430}
        status='checking'
        coverage={emptyCoverage()}
        previous={{ status: 'valid', coverage: missingCoverage(24, 430) }}
      />
    )

    expect(screen.getByText('Checking your member list again…')).toBeInTheDocument()
    // Previous verdict still on screen while re-checking.
    expect(screen.getByText(/24 members are missing a DNI\/NIE/)).toBeInTheDocument()
    const statusRegion = screen.getByRole('status')
    expect(statusRegion).toHaveAttribute('aria-busy', 'true')
  })

  it('claims no coverage while the first check is still running', () => {
    render(<CertificateAuthSummary membersCount={430} status='checking' coverage={emptyCoverage()} />)

    const statusRegion = screen.getByRole('status')
    expect(statusRegion).toHaveTextContent('Checking your member list…')
    expect(statusRegion).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText(/can sign in/i)).not.toBeInTheDocument()
  })

  it('says the member list could not be checked instead of claiming coverage', () => {
    render(<CertificateAuthSummary membersCount={430} status='unavailable' coverage={emptyCoverage()} />)

    expect(screen.getByRole('status')).toHaveTextContent("We couldn't check your member list.")
    expect(screen.queryByText(/can sign in/i)).not.toBeInTheDocument()
  })

  it('keeps an unverified previous result unverified while re-checking over it', () => {
    const { unmount } = render(
      <CertificateAuthSummary
        membersCount={430}
        status='checking'
        coverage={emptyCoverage()}
        previous={{ status: 'rejected', coverage: emptyCoverage() }}
      />
    )
    expect(screen.getByText(/these settings don't fit your member list/i)).toBeInTheDocument()
    expect(screen.queryByText(/can sign in/i)).not.toBeInTheDocument()
    unmount()

    render(
      <CertificateAuthSummary
        membersCount={430}
        status='checking'
        coverage={emptyCoverage()}
        previous={{ status: 'unavailable', coverage: emptyCoverage() }}
      />
    )
    expect(screen.getByText("We couldn't check your member list.")).toBeInTheDocument()
    expect(screen.queryByText(/can sign in/i)).not.toBeInTheDocument()
  })

  it('shows the mismatch line for duplicates or a rejected census', () => {
    const duplicated: CertificateCoverage = { ...emptyCoverage(), duplicates: ['m1', 'm2'] }
    const { unmount } = render(<CertificateAuthSummary membersCount={430} status='invalid' coverage={duplicated} />)
    expect(screen.getByText(/these settings don't fit your member list/i)).toBeInTheDocument()
    unmount()

    render(<CertificateAuthSummary membersCount={430} status='rejected' coverage={emptyCoverage()} />)
    expect(screen.getByText(/these settings don't fit your member list/i)).toBeInTheDocument()
  })
})
