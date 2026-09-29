import { useCallback, useState } from 'react'

export interface ConnectionStatus {
  isOffline: boolean
  failureCount: number
}

// Set as 1 because this is used in react query error handling, which already does retries
const failureThreshold = 1

/**
 * Hook to monitor API connection status based on consecutive failures
 * Shows toast notifications when connection issues are detected
 */
export const useConnectionMonitor = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOffline: false,
    failureCount: 0,
  })

  /**
   * Record a failed API request
   * After failureThreshold consecutive failures, marks connection as offline
   */
  const recordFailure = useCallback(() => {
    setStatus((prev) => {
      const failureCount = prev.failureCount + 1
      return {
        isOffline: failureCount >= failureThreshold,
        failureCount,
      }
    })
  }, [])

  /**
   * Record a successful API request
   * Resets failure count and marks connection as online
   */
  const recordSuccess = useCallback(() => {
    setStatus({
      isOffline: false,
      failureCount: 0,
    })
  }, [])

  return {
    status,
    recordFailure,
    recordSuccess,
  }
}
