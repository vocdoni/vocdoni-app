import { ChakraProvider } from '@chakra-ui/react'
import { render } from '@testing-library/react'
import { ColorModeProvider } from '~theme/color-mode'
import { system } from '~theme/system'
import { ElectionTitle } from './ElectionTitle'

vi.mock('@vocdoni/react-providers', () => ({
  useElection: () => ({ election: { id: 'election-1' } }),
}))

describe('ElectionTitle', () => {
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
