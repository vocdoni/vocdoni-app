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
  ] as const)('grades %j with code %s as %s', (credentials, codeMethod, expected) => {
    expect(getProtectionLevel(credentials, codeMethod)).toBe(expected)
  })
})

describe('ProtectionMeter', () => {
  // The admin knows their member list: the meter states the risk, it doesn't
  // tell them which details to pick.
  it.each([
    [['name'], 'none'],
    [['memberNumber'], 'none'],
    [['name', 'memberNumber'], 'none'],
    [[], 'email'],
    [['memberNumber'], 'sms'],
  ] as const)('gives no advice for %j with code %s', (credentials, codeMethod) => {
    const { getByTestId } = render(createElement(ProtectionMeter, { credentials, codeMethod }))

    expect(getByTestId('protection-level')).not.toHaveTextContent(/\badd\b|member number|send a code/i)
  })
})
