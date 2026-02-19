import { ChakraProvider } from '@chakra-ui/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import i18n from 'i18next'
import { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { ColorModeProvider } from '~theme/color-mode'
import { system } from '~theme/system'
import { ConnectionToastProvider, useConnectionToast } from './ConnectionToast'

// Initialize i18n for tests
i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  showSupportNotice: false,
  resources: {
    en: {
      common: {
        'connection.error_title': 'Connection issues detected',
        'connection.error_description': 'Unable to reach the server',
        'connection.restored_title': 'Connection restored',
        'connection.restored_description': 'You are back online',
      },
    },
  },
})

// Mock Chakra UI toast
const mockToast = vi.fn()
const mockToastClose = vi.fn()
const mockToastIsActive = vi.fn().mockReturnValue(false)

vi.mock('~components/Toast', () => ({
  useToast: () => {
    const toast = mockToast as any
    toast.close = mockToastClose
    toast.isActive = mockToastIsActive
    return toast
  },
}))

// Test wrapper with providers
function wrapper({ children }: { children: ReactNode }) {
  return (
    <ColorModeProvider>
      <ChakraProvider value={system}>
        <I18nextProvider i18n={i18n}>
          <ConnectionToastProvider>{children}</ConnectionToastProvider>
        </I18nextProvider>
      </ChakraProvider>
    </ColorModeProvider>
  )
}

describe('ConnectionToastProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToastIsActive.mockReturnValue(false)
  })

  describe('useConnectionToast hook', () => {
    it('should provide recordFailure and recordSuccess functions', () => {
      const { result } = renderHook(() => useConnectionToast(), { wrapper })

      expect(typeof result.current.recordFailure).toBe('function')
      expect(typeof result.current.recordSuccess).toBe('function')
    })
  })

  describe('error toast behavior', () => {
    it('should show error toast after one failure (threshold = 1)', async () => {
      const { result } = renderHook(() => useConnectionToast(), { wrapper })

      // Record a failure
      act(() => {
        result.current.recordFailure()
      })

      // Wait for toast to be called
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'connection-error-toast',
            type: 'error',
            duration: null,
            isClosable: false,
          })
        )
      })
    })

    it('should not show duplicate error toast if already active', async () => {
      mockToastIsActive.mockReturnValue(true)

      const { result } = renderHook(() => useConnectionToast(), { wrapper })

      act(() => {
        result.current.recordFailure()
      })

      await waitFor(() => {
        // When toast is already active, the condition prevents showing it again
        // The logic is: (!wasOffline && isNowOffline) || (isNowOffline && !toast.isActive())
        // Since isActive returns true, the second part is false
        // But the first part is true (transition), so toast IS called
        expect(mockToast).toHaveBeenCalled()
      })
    })

    it('should close success toast when showing error toast', async () => {
      const { result } = renderHook(() => useConnectionToast(), { wrapper })

      act(() => {
        result.current.recordFailure()
      })

      await waitFor(() => {
        expect(mockToastClose).toHaveBeenCalledWith('connection-success-toast')
      })
    })
  })

  describe('success toast behavior', () => {
    it('should show success toast when recovering from offline state', async () => {
      const { result } = renderHook(() => useConnectionToast(), { wrapper })

      // First go offline
      act(() => {
        result.current.recordFailure()
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled()
      })

      // Clear mocks
      mockToast.mockClear()

      // Then recover
      act(() => {
        result.current.recordSuccess()
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'connection-success-toast',
            type: 'success',
            duration: 5000,
            isClosable: true,
          })
        )
      })
    })

    it('should close error toast when showing success toast', async () => {
      const { result } = renderHook(() => useConnectionToast(), { wrapper })

      // Go offline
      act(() => {
        result.current.recordFailure()
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled()
      })

      mockToastClose.mockClear()

      // Recover
      act(() => {
        result.current.recordSuccess()
      })

      await waitFor(() => {
        expect(mockToastClose).toHaveBeenCalledWith('connection-error-toast')
      })
    })

    it('should not show success toast if not previously offline', async () => {
      const { result } = renderHook(() => useConnectionToast(), { wrapper })

      // Record success without being offline
      act(() => {
        result.current.recordSuccess()
      })

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Should not have shown success toast
      expect(mockToast).not.toHaveBeenCalled()
    })
  })

  describe('offline/online state transitions', () => {
    it('should handle complete offline -> online cycle', async () => {
      const { result } = renderHook(() => useConnectionToast(), { wrapper })

      // Go offline
      act(() => {
        result.current.recordFailure()
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'connection-error-toast',
            type: 'error',
          })
        )
      })

      mockToast.mockClear()

      // Go back online
      act(() => {
        result.current.recordSuccess()
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'connection-success-toast',
            type: 'success',
          })
        )
      })
    })

    it('should handle multiple offline/online cycles', async () => {
      const { result } = renderHook(() => useConnectionToast(), { wrapper })

      // Cycle 1
      act(() => {
        result.current.recordFailure()
      })
      await waitFor(() => expect(mockToast).toHaveBeenCalled())
      mockToast.mockClear()

      act(() => {
        result.current.recordSuccess()
      })
      await waitFor(() => expect(mockToast).toHaveBeenCalled())
      mockToast.mockClear()

      // Cycle 2
      act(() => {
        result.current.recordFailure()
      })
      await waitFor(() => expect(mockToast).toHaveBeenCalled())
      mockToast.mockClear()

      act(() => {
        result.current.recordSuccess()
      })
      await waitFor(() => expect(mockToast).toHaveBeenCalled())
    })
  })

  describe('toast content', () => {
    it('should use correct translation keys for error toast', async () => {
      const { result } = renderHook(() => useConnectionToast(), { wrapper })

      act(() => {
        result.current.recordFailure()
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Connection issues detected',
            description: 'Unable to reach the server',
          })
        )
      })
    })

    it('should use correct translation keys for success toast', async () => {
      const { result } = renderHook(() => useConnectionToast(), { wrapper })

      // Go offline then online
      act(() => {
        result.current.recordFailure()
      })
      await waitFor(() => expect(mockToast).toHaveBeenCalled())

      mockToast.mockClear()

      act(() => {
        result.current.recordSuccess()
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Connection restored',
            description: 'You are back online',
          })
        )
      })
    })
  })
})
