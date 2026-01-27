import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ChakraProvider } from '@chakra-ui/react'
import { ColorModeProvider } from '~theme/color-mode'
import { system } from '~theme'
import { useConfirm } from './useConfirm'
import { ConfirmProvider } from './ConfirmProvider'

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
