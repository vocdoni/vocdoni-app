import { render, screen } from '~src/test-utils'
import { getSecurityLevel, getSecurityLevelMessages, SecurityLevels } from './SecurityLevel'

describe('getSecurityLevelMessages', () => {
  it('renders weak recommendations list', () => {
    const message = getSecurityLevelMessages(SecurityLevels.WEAK)
    render(<div>{message.alert.description}</div>)

    expect(screen.getByText('Add more credentials (aim for 2) for better identity verification')).toBeInTheDocument()
  })
})

describe('getSecurityLevel', () => {
  it.each([
    [false, ['name', 'surname', 'memberNumber', 'password'], SecurityLevels.MID],
    [false, ['name', 'surname', 'memberNumber'], SecurityLevels.MID],
    [false, ['memberNumber', 'password'], SecurityLevels.MID],
    [false, ['password'], SecurityLevels.WEAK],
    [false, ['memberNumber'], SecurityLevels.WEAK],
    [false, ['memberNumber', 'name'], SecurityLevels.WEAK],
    [true, ['password'], SecurityLevels.STRONG],
    [true, [], SecurityLevels.STRONG],
  ])('use2FA=%s %j is %s', (use2FA, credentials, expected) => {
    expect(getSecurityLevel(use2FA, credentials)).toBe(expected)
  })
})
