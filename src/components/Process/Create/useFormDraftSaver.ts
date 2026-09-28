import type { CreateVotingProcessRequest } from '@vocdoni/api-types'
import { useOrganization } from '@vocdoni/react-components'
import { useCallback, useEffect, useRef, useState } from 'react'
import { isDraftLimitError } from './draft-limit'
import { getStoredDraftId } from './draft-storage'
import { useCreateProcess, useUpdateProcess } from './queries'
import { buildCensusSpec, useFormToVotingProcessRequest } from './request'

export const saveTimeoutMs = 30000

export const useFormDraftSaver = (
  isDirty: boolean,
  getValues: () => any,
  draftId: string | null,
  storeDraftId: (id: string | null) => void,
  saveCooldown?: (ms: number) => void
) => {
  const createProcess = useCreateProcess()
  const updateProcess = useUpdateProcess()
  const formToVotingProcessRequest = useFormToVotingProcessRequest()
  const { organization } = useOrganization()
  const skipNextSaveRef = useRef(false)
  const [draftLimitReached, setDraftLimitReached] = useState(false)
  // Saving a draft replaces its whole question set server-side (the API deletes
  // the stored questions and inserts the ones it receives), so two writes in
  // flight at once can interleave and leave a duplicated question behind. Every
  // write goes through this queue, one at a time.
  const pendingWriteRef = useRef<Promise<unknown> | null>(null)
  // The id the next write must target, tracked outside React state so a write
  // queued before a re-render still updates the draft its predecessor created
  // instead of creating a second one.
  const draftIdRef = useRef(draftId)

  useEffect(() => {
    draftIdRef.current = draftId
  }, [draftId])

  const isCreating = createProcess.isPending
  const isUpdating = updateProcess.isPending
  const isSaving = isCreating || isUpdating

  const skipSave = (skip) => {
    skipNextSaveRef.current = skip
  }

  const enqueueWrite = useCallback(<T>(write: () => Promise<T>): Promise<T> => {
    const run = (pendingWriteRef.current ?? Promise.resolve()).then(write, write)
    const settled = run.then(
      () => undefined,
      () => undefined
    )
    pendingWriteRef.current = settled
    void settled.then(() => {
      if (pendingWriteRef.current === settled) pendingWriteRef.current = null
    })
    return run
  }, [])

  // The single write path for a draft, used by both auto-save and publish.
  // Create-vs-update is decided *inside* the queued callback, against the ref:
  // deciding it in a render closure means a write queued while a previous
  // `createProcess` is still in flight sees a stale null id and creates a
  // second process, orphaning the first. `getBody` is called when the write
  // runs, not when it is queued, so a save that waited its turn still sends
  // the latest form. Resolves with the draft id the write landed on.
  const writeDraft = useCallback(
    (getBody: () => CreateVotingProcessRequest) =>
      enqueueWrite(async () => {
        const body = getBody()
        if (draftIdRef.current) {
          await updateProcess.mutateAsync({ processId: draftIdRef.current, body })
          return draftIdRef.current
        }
        const draftProcessId = await createProcess.mutateAsync(body)
        // Record the new id before returning: a publish that fails after this
        // point must keep updating this draft instead of leaking another one.
        draftIdRef.current = draftProcessId
        storeDraftId(draftProcessId)
        return draftProcessId
      }),
    [enqueueWrite, updateProcess, createProcess, storeDraftId]
  )

  const saveDraft = useCallback(
    async (isAutoSave = true) => {
      if (!isDirty || skipNextSaveRef.current) return 'skipped'
      // A draft can't be created without its owner org: wait for the address to resolve
      // instead of firing a request the API would reject.
      if (!organization?.address) return 'skipped'
      // Prevent repeated auto-save attempts once the draft limit is reached
      if (isAutoSave && draftLimitReached) return 'limit-reached'
      // Auto-saves fire on every blur: queueing one behind another only sends
      // the same values twice, and the interval picks up whatever changed
      // while a write was running.
      if (isAutoSave && pendingWriteRef.current) return 'skipped'

      try {
        // A draft is an unpublished process, so it is saved through the same
        // structured create/update requests the publish step uses. The values
        // are read when the write runs, not when it is queued, so a save that
        // waited for its turn still sends the latest form.
        await writeDraft(() => {
          const form = getValues()
          return formToVotingProcessRequest(form, buildCensusSpec(form))
        })
        saveCooldown?.(saveTimeoutMs)
        setDraftLimitReached(false)
        return 'saved'
      } catch (e) {
        // Check if it's a draft limit error
        if (isDraftLimitError(e)) {
          setDraftLimitReached(true)
          // Silently fail for auto-save, throw for manual save
          if (isAutoSave) {
            return 'limit-reached'
          }
          throw e
        }
        // For other errors, only log in auto-save mode
        if (isAutoSave) {
          console.error('Failed to save draft:', e)
          return 'error'
        }
        throw e
      }
    },
    [isDirty, draftLimitReached, organization?.address, getValues, writeDraft, formToVotingProcessRequest, saveCooldown]
  )

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return
      e.preventDefault()
      e.returnValue = ''
      saveDraft(true)
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty, saveDraft])

  useEffect(() => {
    const handleFocusOut = () => {
      saveDraft(true)
    }
    window.addEventListener('focusout', handleFocusOut)
    return () => window.removeEventListener('focusout', handleFocusOut)
  }, [saveDraft])

  useEffect(() => {
    const id = setInterval(() => {
      saveDraft(true)
    }, saveTimeoutMs)
    return () => clearInterval(id)
  }, [saveDraft])

  // Publishing turns the draft into a process, so the stored pointer must be
  // dropped: a later "delete draft" following it would delete the vote we just
  // published. Only when it actually points at *this* draft though — publishing
  // one opened straight from the drafts list (`?draftId=`) must not forget an
  // unrelated resumable draft. Reads storage rather than the `draftId` prop:
  // on the create path the id is stored inside the write queue, after the
  // caller's render closure was captured, so the prop is stale (null) here.
  const clearPublishedDraftId = useCallback(
    (processId: string) => {
      if (getStoredDraftId(organization?.address) === processId) {
        storeDraftId(null)
      }
    },
    [organization?.address, storeDraftId]
  )

  return { saveDraft, isSaving, skipSave, draftLimitReached, writeDraft, clearPublishedDraftId }
}
