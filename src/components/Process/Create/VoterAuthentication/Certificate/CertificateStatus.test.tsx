import { screen } from '@testing-library/react'
import { render } from '~src/test-utils'
import type { CertificateCoverage } from '~src/queries/certificateAuth/warnings'
import { CertificateStatus } from './CertificateStatus'

const cleanCoverage: CertificateCoverage = {
  cannotSignIn: 0,
  missing: [],
  invalid: [],
  duplicates: [],
  counts: { missing: 0, letter: 0, otherId: 0 },
}

const missingCoverage: CertificateCoverage = {
  cannotSignIn: 24,
  missing: Array.from({ length: 24 }, (_, i) => `m${i}`),
  invalid: [],
  duplicates: [],
  counts: { missing: 24, letter: 0, otherId: 0 },
}

const dupCoverage: CertificateCoverage = {
  cannotSignIn: 0,
  missing: [],
  invalid: [],
  duplicates: ['d1', 'd2'],
  counts: { missing: 0, letter: 0, otherId: 0 },
}

describe('CertificateStatus', () => {
  it('shows "All N members can sign in." for a clean coverage', () => {
    render(<CertificateStatus coverage={cleanCoverage} membersCount={430} attempted={false} />)

    expect(screen.getByText('All 430 members can sign in.')).toBeInTheDocument()
  })

  it('shows the missing line and "Fix your member list" link for missing-only coverage', () => {
    render(<CertificateStatus coverage={missingCoverage} membersCount={430} attempted={false} />)

    expect(screen.getByText(/24 members can't sign in: missing a valid DNI\/NIE\./)).toBeInTheDocument()
    const fixLink = screen.getByRole('link', { name: /Fix your member list/ })
    expect(fixLink).toBeInTheDocument()
    expect(fixLink).toHaveAttribute('target', '_blank')
    expect(screen.getByText('(opens in a new tab)')).toBeInTheDocument()
  })

  it('shows the duplicate line first and idle hint when not attempted', () => {
    render(<CertificateStatus coverage={dupCoverage} membersCount={430} attempted={false} />)

    expect(screen.getByText(/2 members share the same DNI\/NIE, so they can't be told apart\./)).toBeInTheDocument()
    // Idle hint in the live region
    const hint = document.getElementById('voter-auth-certificate-hint')
    expect(hint).toBeInTheDocument()
    expect(hint).toHaveTextContent('You can save once each member has their own DNI/NIE.')
  })

  it('shows the attempted hint when attempted is true', () => {
    render(<CertificateStatus coverage={dupCoverage} membersCount={430} attempted={true} />)

    const hint = document.getElementById('voter-auth-certificate-hint')
    expect(hint).toHaveTextContent('To save, give the 2 members who share a DNI/NIE their own.')
  })
})
