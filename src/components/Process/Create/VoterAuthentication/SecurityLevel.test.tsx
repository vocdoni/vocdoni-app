import { render, screen } from '~src/test-utils'
import { getSecurityLevelMessages, SecurityLevels } from './SecurityLevel'

describe('getSecurityLevelMessages', () => {
  it('renders weak recommendations list', () => {
    const message = getSecurityLevelMessages(SecurityLevels.WEAK)
    render(<div>{message.alert.description}</div>)

    expect(screen.getByText('Add more credentials (aim for 2) for better identity verification')).toBeInTheDocument()
  })
})
