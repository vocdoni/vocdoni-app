import { AlertRoot } from '@chakra-ui/react'
import { render } from '~src/test-utils'
import { AlertIcon } from './AlertIcon'

describe('AlertIcon', () => {
  it('renders inside Alert context', () => {
    const { container } = render(
      <AlertRoot status='info'>
        <AlertIcon />
      </AlertRoot>
    )

    expect(container.querySelector('.chakra-alert__icon')).toBeTruthy()
  })
})
