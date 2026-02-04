import { act, renderHook } from '@testing-library/react'
import { useConnectionMonitor } from './use-connection-monitor'

describe('useConnectionMonitor', () => {
  describe('initial state', () => {
    it('should start with offline = false and failureCount = 0', () => {
      const { result } = renderHook(() => useConnectionMonitor())

      expect(result.current.status.isOffline).toBe(false)
      expect(result.current.status.failureCount).toBe(0)
      expect(result.current.status.lastFailureTime).toBe(null)
    })

    it('should provide recordFailure, recordSuccess, and reset functions', () => {
      const { result } = renderHook(() => useConnectionMonitor())

      expect(typeof result.current.recordFailure).toBe('function')
      expect(typeof result.current.recordSuccess).toBe('function')
      expect(typeof result.current.reset).toBe('function')
    })
  })

  describe('recordFailure', () => {
    it('should increment failureCount when called', () => {
      const { result } = renderHook(() => useConnectionMonitor())

      act(() => {
        result.current.recordFailure()
      })

      expect(result.current.status.failureCount).toBe(1)
      expect(result.current.status.isOffline).toBe(true) // Threshold is 1
    })

    it('should mark as offline after reaching threshold (1 failure)', () => {
      const { result } = renderHook(() => useConnectionMonitor())

      expect(result.current.status.isOffline).toBe(false)

      act(() => {
        result.current.recordFailure()
      })

      expect(result.current.status.isOffline).toBe(true)
      expect(result.current.status.failureCount).toBe(1)
    })

    it('should set lastFailureTime when failure is recorded', () => {
      const { result } = renderHook(() => useConnectionMonitor())
      const beforeTime = Date.now()

      act(() => {
        result.current.recordFailure()
      })

      const afterTime = Date.now()

      expect(result.current.status.lastFailureTime).toBeGreaterThanOrEqual(beforeTime)
      expect(result.current.status.lastFailureTime).toBeLessThanOrEqual(afterTime)
    })

    it('should continue incrementing failureCount beyond threshold', () => {
      const { result } = renderHook(() => useConnectionMonitor())

      act(() => {
        result.current.recordFailure()
        result.current.recordFailure()
        result.current.recordFailure()
      })

      expect(result.current.status.failureCount).toBe(3)
      expect(result.current.status.isOffline).toBe(true)
    })
  })

  describe('recordSuccess', () => {
    it('should reset failureCount to 0', () => {
      const { result } = renderHook(() => useConnectionMonitor())

      // First record some failures
      act(() => {
        result.current.recordFailure()
        result.current.recordFailure()
      })

      expect(result.current.status.failureCount).toBe(2)

      // Then record success
      act(() => {
        result.current.recordSuccess()
      })

      expect(result.current.status.failureCount).toBe(0)
    })

    it('should mark as online', () => {
      const { result } = renderHook(() => useConnectionMonitor())

      // First go offline
      act(() => {
        result.current.recordFailure()
      })

      expect(result.current.status.isOffline).toBe(true)

      // Then recover
      act(() => {
        result.current.recordSuccess()
      })

      expect(result.current.status.isOffline).toBe(false)
    })

    it('should clear lastFailureTime', () => {
      const { result } = renderHook(() => useConnectionMonitor())

      act(() => {
        result.current.recordFailure()
      })

      expect(result.current.status.lastFailureTime).not.toBe(null)

      act(() => {
        result.current.recordSuccess()
      })

      expect(result.current.status.lastFailureTime).toBe(null)
    })
  })

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useConnectionMonitor())

      // Set some state
      act(() => {
        result.current.recordFailure()
        result.current.recordFailure()
      })

      expect(result.current.status.failureCount).toBe(2)

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.status.isOffline).toBe(false)
      expect(result.current.status.failureCount).toBe(0)
      expect(result.current.status.lastFailureTime).toBe(null)
    })

    it('should work when called from initial state', () => {
      const { result } = renderHook(() => useConnectionMonitor())

      act(() => {
        result.current.reset()
      })

      expect(result.current.status.isOffline).toBe(false)
      expect(result.current.status.failureCount).toBe(0)
      expect(result.current.status.lastFailureTime).toBe(null)
    })
  })

  describe('offline/online transitions', () => {
    it('should transition from online to offline after threshold', () => {
      const { result } = renderHook(() => useConnectionMonitor())

      expect(result.current.status.isOffline).toBe(false)

      act(() => {
        result.current.recordFailure()
      })

      expect(result.current.status.isOffline).toBe(true)
    })

    it('should transition from offline to online on success', () => {
      const { result } = renderHook(() => useConnectionMonitor())

      // Go offline
      act(() => {
        result.current.recordFailure()
      })

      expect(result.current.status.isOffline).toBe(true)

      // Go back online
      act(() => {
        result.current.recordSuccess()
      })

      expect(result.current.status.isOffline).toBe(false)
    })

    it('should handle multiple offline/online cycles', () => {
      const { result } = renderHook(() => useConnectionMonitor())

      // Cycle 1: offline
      act(() => {
        result.current.recordFailure()
      })
      expect(result.current.status.isOffline).toBe(true)

      // Back online
      act(() => {
        result.current.recordSuccess()
      })
      expect(result.current.status.isOffline).toBe(false)

      // Cycle 2: offline again
      act(() => {
        result.current.recordFailure()
      })
      expect(result.current.status.isOffline).toBe(true)

      // Back online again
      act(() => {
        result.current.recordSuccess()
      })
      expect(result.current.status.isOffline).toBe(false)
    })
  })
})
