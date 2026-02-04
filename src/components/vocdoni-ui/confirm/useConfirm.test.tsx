import { ChakraProvider } from '@chakra-ui/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { ColorModeProvider } from '~theme/color-mode'
import { system } from '~theme/system'
import { ConfirmProvider } from './ConfirmProvider'
import { useConfirm } from './useConfirm'

describe('useConfirm', () => {
  it('opens prompt when confirm called', async () => {
    const { result } = renderHook(() => useConfirm(), {
      wrapper: ({ children }) => (
        <ColorModeProvider>
          <ChakraProvider value={system}>
            <ConfirmProvider>{children}</ConfirmProvider>
          </ChakraProvider>
        </ColorModeProvider>
      ),
    })
    let promise: Promise<boolean>
    await act(async () => {
      promise = result.current.confirm('Are you sure?')
    })
    await waitFor(() => {
      expect(result.current.isOpen).toBe(true)
      result.current.cancel?.()
    })
    await promise!
  })
})
