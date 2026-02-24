import { Flex } from '@chakra-ui/react'
import { render } from '~src/test-utils'
import { BallotBoxAnimated } from './BallotBoxAnimated'

describe('BallotBoxAnimated', () => {
  it('supports Chakra layout props and forwards html props', () => {
    const { getByTestId } = render(
      <Flex direction='column'>
        <BallotBoxAnimated data-testid='ballot-box' alignSelf='center' size={180} />
      </Flex>
    )

    const svg = getByTestId('ballot-box')

    expect(svg).toHaveStyle({ width: '180px', height: '180px', alignSelf: 'center' })
  })
})
