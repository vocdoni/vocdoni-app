/** Editor chrome handed to each layout shell. Pure UI state + actions; all form
 * data flows through the react-hook-form context. */
export type EditorChrome = {
  effectiveDraftId: string | null
  isDirty: boolean
  isSubmitting: boolean
  isSaving: boolean
  /** Opens the leave/reset confirmation modal. */
  onReset: () => void
  /** Manual "save draft". */
  onManualSave: () => void
}
