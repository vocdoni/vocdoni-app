import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ChakraProvider } from '@chakra-ui/react'
import { useConfirm } from './useConfirm'
import { ConfirmProvider } from './ConfirmProvider'

describe('useConfirm', () => {
  it('opens prompt when confirm called', async () => {
    const { result } = renderHook(() => useConfirm(), {
      wrapper: ({ children }) => (
        <ChakraProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </ChakraProvider>
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
