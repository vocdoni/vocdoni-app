import { useEffect, useState } from 'react'

/** The current time, refreshed every `intervalMs`, so a screen notices a start or end date passing while it is open. */
export const useNow = (intervalMs = 30_000): Date => {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
  return now
}
