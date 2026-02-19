import { useToast } from '~components/Toast'
import { createContext, ReactNode, useContext, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useConnectionMonitor } from '~utils/use-connection-monitor'

interface ConnectionToastContextValue {
  recordFailure: () => void
  recordSuccess: () => void
}

const ConnectionToastContext = createContext<ConnectionToastContextValue | undefined>(undefined)

const toastErrorId = 'connection-error-toast'
const toastSuccessId = 'connection-success-toast'

export const ConnectionToastProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation()
  const toast = useToast()
  const { status, recordFailure, recordSuccess } = useConnectionMonitor()

  // Track previous offline state to detect transitions
  const prevOfflineRef = useRef(status.isOffline)

  useEffect(() => {
    const wasOffline = prevOfflineRef.current
    const isNowOffline = status.isOffline

    // Connection lost - show persistent error toast
    // Check both transition AND current state to handle timing issues
    if ((!wasOffline && isNowOffline) || (isNowOffline && !toast.isActive(toastErrorId))) {
      // Close any existing toasts first
      toast.close(toastSuccessId)

      // Show persistent error toast
      toast({
        id: toastErrorId,
        title: t('connection.error_title', 'Connection issues detected'),
        description: t('connection.error_description', 'Unable to reach the server. Please check your connection.'),
        type: 'error',
        duration: null, // Persistent
        isClosable: false,
      })
    }

    // Connection restored - show success toast and close error toast
    if (wasOffline && !isNowOffline) {
      // Close error toast
      toast.close(toastErrorId)

      // Show success toast (dismissable with timeout)
      if (!toast.isActive(toastSuccessId)) {
        toast({
          id: toastSuccessId,
          title: t('connection.restored_title', 'Connection restored'),
          description: t('connection.restored_description', 'You are back online.'),
          type: 'success',
          duration: 5000,
          isClosable: true,
        })
      }
    }

    prevOfflineRef.current = isNowOffline
  }, [status.isOffline, status.failureCount, toast, t])

  const contextValue: ConnectionToastContextValue = {
    recordFailure,
    recordSuccess,
  }

  return <ConnectionToastContext.Provider value={contextValue}>{children}</ConnectionToastContext.Provider>
}

/**
 * Hook to access connection monitoring functions
 * Used internally by React Query error handlers
 */
export const useConnectionToast = () => {
  const context = useContext(ConnectionToastContext)
  if (context === undefined) {
    throw new Error('useConnectionToast must be used within a ConnectionToastProvider')
  }
  return context
}
