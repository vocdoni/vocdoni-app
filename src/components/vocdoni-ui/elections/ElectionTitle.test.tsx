import { ChakraProvider } from '@chakra-ui/react'
import { render } from '@testing-library/react'
import { ColorModeProvider } from '~theme/color-mode'
import { system } from '~theme/system'
import { mockUseElection } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { ElectionTitle } from './ElectionTitle'

describe('ElectionTitle', () => {
  beforeEach(() => {
    setReactProvidersMock({
      useElection: () => mockUseElection({ election: { id: 'election-1' } }),
    })
  })

  it('renders heading content', () => {
    const { getByText } = render(
      <ColorModeProvider>
        <ChakraProvider value={system}>
          <ElectionTitle />
        </ChakraProvider>
      </ColorModeProvider>
    )
    expect(getByText('election-1')).toBeTruthy()
  })
})
