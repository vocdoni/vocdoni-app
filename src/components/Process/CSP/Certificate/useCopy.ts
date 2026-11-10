import { useEffect, useState } from 'react'

export type CopyResult = 'idle' | 'copied' | 'failed'

/** Clipboard write with an honest confirmation: "Copied" only when the write succeeded. Resets after 4 s. */
export const useCopy = (value: string) => {
  const [result, setResult] = useState<CopyResult>('idle')

  useEffect(() => {
    if (result !== 'copied') return
    const timer = setTimeout(() => setResult('idle'), 4000)
    return () => clearTimeout(timer)
  }, [result])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setResult('copied')
    } catch {
      setResult('failed')
    }
  }

  return { result, copy }
}
