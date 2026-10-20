import type { TFunction } from 'i18next'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ErrorCode, FileRejection } from 'react-dropzone'

// react-dropzone only flags too-many-files when several files are accepted, so a supported file dropped alongside an
// unsupported one also counts as too many. Only holds for `multiple: false` dropzones
const isTooManyFiles = (accepted: File[], rejections: FileRejection[]) =>
  accepted.length > 0 || rejections.some(({ errors }) => errors.some(({ code }) => code === ErrorCode.TooManyFiles))

// react-dropzone calls onDrop even when every file was rejected, so explain why instead of silently doing nothing.
// Returns undefined when nothing was rejected.
export const dropRejectionMessage = (
  t: TFunction,
  accepted: File[],
  rejections: FileRejection[],
  invalidTypeMessage: string
): string | undefined => {
  if (!rejections.length) return
  return isTooManyFiles(accepted, rejections)
    ? t('uploader.error.too_many_files', { defaultValue: 'Upload one file at a time.' })
    : invalidTypeMessage
}

// Tracks the latest drop on a dropzone, so the async work (a read, an upload) of an earlier drop can't overwrite the
// outcome of a newer one, and nothing is written once the dropzone unmounts. `busy` is true while the latest drop's
// work runs.
export const useLatestDrop = () => {
  const latest = useRef(0)
  const [busy, setBusy] = useState(false)
  useEffect(
    () => () => {
      latest.current++
    },
    []
  )
  // Supersedes any earlier drop and returns the new drop's token. `working` is false for a drop with nothing to run
  // (e.g. a rejected one), which also stops the spinner of the drop it supersedes
  const start = useCallback((working: boolean) => {
    setBusy(working)
    return ++latest.current
  }, [])
  const isLatest = useCallback((drop: number) => drop === latest.current, [])
  const finish = useCallback((drop: number) => {
    if (drop === latest.current) setBusy(false)
  }, [])

  return { busy, start, isLatest, finish }
}
