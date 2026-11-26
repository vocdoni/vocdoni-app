import { useQuestionsForm } from '@vocdoni/react-components'
import { useCallback, useEffect, useRef, type Dispatch } from 'react'
import type { Answer, VoterAction } from './voter-flow'

const QUESTION_FIELD = /^\d+$/
const MEMO_FIELD = /^memo\.(\d+)$/

/**
 * The flow owns the answers (audit F1). Every change the voter makes in the SDK form is copied into the flow; a reset
 * of the form (the SDK resets it whenever the process read changes identity, which most polls do) is undone by
 * writing the stored answers back once the reset is done. Must be rendered inside `QuestionsFormProvider`.
 */
export const useOwnedAnswers = (
  answers: Record<string, Answer>,
  memos: Record<string, string>,
  dispatch: Dispatch<VoterAction>
) => {
  const { fmethods } = useQuestionsForm()
  const stored = useRef({ answers, memos })
  stored.current = { answers, memos }

  useEffect(() => {
    let live = true
    let restoring = false
    const restore = () => {
      restoring = true
      try {
        for (const [key, value] of Object.entries(stored.current.answers)) fmethods.setValue(key, value)
        for (const [key, value] of Object.entries(stored.current.memos)) fmethods.setValue(`memo.${key}`, value)
      } finally {
        restoring = false
      }
    }
    restore()
    const subscription = fmethods.watch((values, { name }) => {
      if (!name) {
        // A reset is still running here: the fields subscribed after this hook have not seen its empty values yet and
        // would overwrite a restore made now. Write the answers back once it is done, before the browser paints.
        queueMicrotask(() => {
          if (live) restore()
        })
        return
      }
      // The restore's own writes are not the voter's: storing them again would clear the last cast error.
      if (restoring) return
      if (QUESTION_FIELD.test(name)) {
        const value = (values as Record<string, unknown>)[name]
        if (typeof value === 'string' || Array.isArray(value))
          dispatch({ type: 'answer', key: name, value: value as Answer })
        return
      }
      const memo = MEMO_FIELD.exec(name)
      if (memo) {
        const value = (values as { memo?: Record<string, unknown> }).memo?.[memo[1]]
        dispatch({ type: 'memo', key: memo[1], value: typeof value === 'string' ? value : '' })
      }
    })
    return () => {
      live = false
      subscription.unsubscribe()
    }
  }, [fmethods, dispatch])

  /** Another voter on the same device: drop the stored answers before the form is emptied, so nothing comes back. */
  const forgetAll = useCallback(() => {
    stored.current = { answers: {}, memos: {} }
    fmethods.reset()
  }, [fmethods])

  return { forgetAll }
}
