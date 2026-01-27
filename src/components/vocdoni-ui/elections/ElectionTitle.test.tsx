import { ChakraProvider } from '@chakra-ui/react'
import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ElectionTitle } from './ElectionTitle'

vi.mock('@vocdoni/react-providers', () => ({
  useElection: () => ({ election: { id: 'election-1' } }),
}))

describe('ElectionTitle', () => {
  it('renders heading content', () => {
    const { getByText } = render(
      <ChakraProvider>
        <ElectionTitle />
      </ChakraProvider>
    )
    expect(getByText('election-1')).toBeTruthy()
  })
})
