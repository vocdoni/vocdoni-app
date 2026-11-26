import { createElement } from 'react'
import { render } from '~src/test-utils'
import { getProtectionLevel, ProtectionMeter } from './ProtectionLevel'

describe('getProtectionLevel', () => {
  it.each([
    [[], 'none', 'unset'],
    [['memberNumber'], 'none', 'basic'],
    // Names are public: asking for more of them does not make impersonation harder.
    [['name', 'surname'], 'none', 'basic'],
    [['name', 'memberNumber'], 'none', 'good'],
    [['memberNumber', 'nationalId', 'birthDate'], 'none', 'good'],
    [[], 'email', 'good'],
    [['name'], 'sms', 'strong'],
    [['memberNumber'], 'voter_choice', 'strong'],
    // The password never lowers the level: it is good beside another detail, basic alone.
    [['memberNumber', 'password'], 'none', 'good'],
    [['name', 'password'], 'none', 'good'],
    [['password'], 'none', 'basic'],
    [['password'], 'email', 'strong'],
  ] as const)('grades %j with code %s as %s', (credentials, codeMethod, expected) => {
    expect(getProtectionLevel(credentials, codeMethod)).toBe(expected)
  })
})

describe('getProtectionLevel with a digital certificate', () => {
  // The certificate proves the voter: it is graded like a detail plus a one-time code, never as basic.
  it.each([
    ['none', 'strong'],
    ['email', 'strong'],
  ] as const)('grades a certificate census with code %s as %s', (codeMethod, expected) => {
    expect(getProtectionLevel(['nationalId'], codeMethod, true)).toBe(expected)
  })
})

describe('ProtectionMeter', () => {
  it.each([
    ['none', /personal certificate/i],
    ['sms', /personal certificate and their email or phone/i],
  ] as const)('explains a certificate census with code %s by the certificate', (codeMethod, text) => {
    const { container } = render(
      createElement(ProtectionMeter, { credentials: ['nationalId'], codeMethod, certAuth: true })
    )
    const meter = container.querySelector('[data-level]')

    expect(meter).toHaveAttribute('data-level', 'strong')
    expect(meter).toHaveTextContent(text)
    expect(meter).not.toHaveTextContent(/anyone who knows these details/i)
  })

  // The admin knows their member list: the meter states the risk, it doesn't
  // tell them which details to pick.
  it.each([
    [['name'], 'none'],
    [['memberNumber'], 'none'],
    [['name', 'memberNumber'], 'none'],
    [[], 'email'],
    [['memberNumber'], 'sms'],
  ] as const)('gives no advice for %j with code %s', (credentials, codeMethod) => {
    const { container } = render(createElement(ProtectionMeter, { credentials, codeMethod }))

    expect(container.querySelector('[data-level]')).not.toHaveTextContent(/\badd\b|member number|send a code/i)
  })
})
