import { Button, Flex, Spacer } from '@chakra-ui/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createPath, useBlocker, useLocation, useNavigate, type Location } from 'react-router'
import DeleteModal from '~components/Modal/DeleteModal'

type ConfirmOnNavigateOptions = {
  isDirty: boolean
  isSubmitting?: boolean
  isSubmitSuccessful?: boolean
  onOpen: () => void
  onClose: () => void
}

type LeaveConfirmationModalProps = {
  isOpen: boolean
  onCancel: () => void
  onSaveAndLeave: () => void
  onLeave: () => void
  onResetSamePath: () => void
  isSamePath: boolean
  // A vote without a title can't be saved as a draft yet, so leaving can only discard it
  canSave?: boolean
}

export const useConfirmOnNavigate = ({
  isDirty,
  isSubmitting,
  isSubmitSuccessful,
  onOpen,
  onClose,
}: ConfirmOnNavigateOptions) => {
  const [snoozeUntil, setSnoozeUntil] = useState<number | null>(null)
  const isSnoozed = snoozeUntil !== null && Date.now() < snoozeUntil

  const shouldBlock = isDirty && !isSubmitting && !isSubmitSuccessful && !isSnoozed
  // The editor moves its own URL along (a new draft's id lands in `?draftId`): that is not
  // leaving the page, so it must never ask to save first
  const blocker = useBlocker(
    useCallback(
      ({ nextLocation }: { nextLocation: Location }) =>
        shouldBlock && !(nextLocation.state as { editorNav?: boolean } | null)?.editorNav,
      [shouldBlock]
    )
  )

  const isOpenRef = useRef(false)
  const isProceedingRef = useRef(false)

  const navigate = useNavigate()
  const { pathname: currentPath } = useLocation()
  const nextPath = blocker.location ? createPath(blocker.location) : null
  const isSamePath = nextPath === null || nextPath === currentPath

  // A "Save and leave" click awaits its draft write; an auto-save landing meanwhile
  // snoozes the blocker and the effect below resets the pending navigation. The refs
  // let `proceed` re-issue that destination and act on the live blocker, not a stale one.
  const pendingLocationRef = useRef<Location | null>(null)
  const blockedFromRef = useRef<string | null>(null)
  const blockerRef = useRef(blocker)
  const currentPathRef = useRef(currentPath)
  useEffect(() => {
    blockerRef.current = blocker
    currentPathRef.current = currentPath
  }, [blocker, currentPath])

  useEffect(() => {
    if (!shouldBlock) {
      if (isOpenRef.current) {
        isOpenRef.current = false
        onClose()
      }
      if (blocker.state === 'blocked') {
        blocker.reset()
      }
      return
    }

    if (blocker.state === 'blocked' && blocker.location) {
      pendingLocationRef.current = blocker.location
      blockedFromRef.current = currentPath
    }

    if (blocker.state === 'blocked' && !isOpenRef.current && !isProceedingRef.current) {
      isOpenRef.current = true
      onOpen()
    }

    if (blocker.state === 'unblocked' && isOpenRef.current) {
      isOpenRef.current = false
      onClose()
    }
  }, [blocker.state, shouldBlock, currentPath, onOpen, onClose])

  // Reset snooze when time is up
  useEffect(() => {
    if (snoozeUntil === null) return

    const msLeft = Math.max(0, snoozeUntil - Date.now())
    const id = setTimeout(() => setSnoozeUntil(null), msLeft)
    return () => clearTimeout(id)
  }, [snoozeUntil])

  const closeAll = () => {
    isProceedingRef.current = false
    isOpenRef.current = false
    onClose()
  }

  // `reset`/`proceed` are `undefined` outside the `blocked` state, and the dialog can
  // still close after an autosave snoozed the blocker. Optional calls make that late
  // call a no-op instead of a TypeError surfacing as an "Error deleting draft" toast.
  const cancel = () => {
    closeAll()
    blockerRef.current.reset?.()
  }

  // Returns whether the pending navigation was actually released, so callers
  // that destroy state on the way out (see `discardAndLeave`) can tell a real
  // departure from a late no-op call that leaves the user on the page.
  const proceed = () => {
    isProceedingRef.current = true
    closeAll()
    // Pin the live blocker: the deferred reset below must act on the object
    // that was released, not on whatever the router hands out later.
    const current = blockerRef.current
    let left = typeof current.proceed === 'function'
    current.proceed?.()

    // Nothing was released (the auto-save race above): re-issue the destination the
    // user picked, unless they navigated elsewhere themselves in the meantime or it
    // is the current path already.
    const pending = pendingLocationRef.current
    const pendingPath = pending ? createPath(pending) : null
    if (
      !left &&
      pendingPath &&
      blockedFromRef.current === currentPathRef.current &&
      pendingPath !== currentPathRef.current
    ) {
      navigate(pendingPath, { state: pending.state })
      left = true
    }

    setTimeout(() => {
      isProceedingRef.current = false
      current.reset?.()
    }, 0)

    return left
  }

  const resetSamePath = (cb?: () => void) => {
    cb?.()
    cancel()
  }

  const saveCooldown = (ms: number) => {
    setSnoozeUntil(Date.now() + Math.max(0, ms))
  }

  return { isSamePath, cancel, proceed, resetSamePath, saveCooldown }
}

export const LeaveConfirmationModal = ({
  isOpen,
  onCancel,
  onLeave,
  onResetSamePath,
  onSaveAndLeave,
  isSamePath,
  canSave = true,
}: LeaveConfirmationModalProps) => {
  const { t } = useTranslation()

  return (
    <DeleteModal
      title={t('process.create.leave_confirmation.title', { defaultValue: 'Unsaved Changes' })}
      subtitle={
        isSamePath
          ? t('process.create.leave_confirmation.reset_message', {
              defaultValue: 'This will reset the form. Do you want to continue?',
            })
          : t('process.create.leave_confirmation.message', {
              defaultValue: 'You have unsaved changes. Are you sure you want to leave?',
            })
      }
      open={isOpen}
      onOpenChange={({ open }) => (!open ? onCancel() : undefined)}
    >
      <Flex justifyContent='flex-end' mt={4} gap={2}>
        <Button variant='outline' onClick={onCancel}>
          {t('process.create.leave_confirmation.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Spacer />
        {isSamePath ? (
          <Button colorPalette='red' onClick={() => onResetSamePath()}>
            {t('process.create.leave_confirmation.reset', { defaultValue: 'Reset' })}
          </Button>
        ) : (
          <>
            <Button colorPalette='red' onClick={onLeave}>
              {t('process.create.leave_confirmation.leave', { defaultValue: 'Leave without saving' })}
            </Button>
            {canSave && (
              <Button onClick={onSaveAndLeave}>
                {t('process.create.leave_confirmation.save_and_leave', { defaultValue: 'Save and leave' })}
              </Button>
            )}
          </>
        )}
      </Flex>
    </DeleteModal>
  )
}
