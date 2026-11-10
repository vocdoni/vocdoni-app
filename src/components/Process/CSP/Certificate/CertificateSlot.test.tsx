import { describe, expect, it } from 'vitest'
import { render } from '~src/test-utils'
import { CertificateSlot } from './CertificateSlot'
import type { CertPhase } from './useCertificateAuth'

const renderSlot = (phase: CertPhase) =>
  render(
    <CertificateSlot phase={phase} idle={<p>idle panel</p>} returning={<p>checking panel</p>}>
      <p>live panel</p>
    </CertificateSlot>
  )

describe('CertificateSlot', () => {
  it('renders both slots during the server render so the head flag can pick one', () => {
    const { container, queryByText } = renderSlot({ kind: 'ssr' })

    expect(container.querySelector('[data-cert-slot="idle"]')).toHaveTextContent('idle panel')
    expect(container.querySelector('[data-cert-slot="returning"]')).toHaveTextContent('checking panel')
    expect(queryByText('live panel')).not.toBeInTheDocument()
  })

  it.each<CertPhase>([{ kind: 'idle' }, { kind: 'checking', slow: false }, { kind: 'stalled' }])(
    'renders only the children once the phase is known ($kind)',
    (phase) => {
      const { container, getByText } = renderSlot(phase)

      expect(getByText('live panel')).toBeInTheDocument()
      expect(container.querySelector('[data-cert-slot]')).toBeNull()
    }
  )
})
