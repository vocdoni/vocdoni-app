import { createContext, useContext } from 'react'

/** The draft behind the editor, for steps that must write it themselves (a census of its own). */
export type DraftControls = {
  /** The draft's id, once it exists */
  id: string | null
  /** The draft's id, saving it first if it doesn't exist yet; `null` while the vote has no name */
  ensure: () => Promise<string | null>
  /** Saves the form as it stands now; resolves with the draft id */
  saveNow: () => Promise<string>
  /**
   * Saves an existing draft with its latest `updatedAt`, so a draft changed somewhere else meanwhile
   * throws `StaleDraftError` rather than being written over
   */
  saveWithLatest: () => Promise<string>
  /** Holds autosave off until the returned function is called */
  pause: () => () => void
  /** Waits for the writes already queued */
  flush: () => Promise<void>
}

type EditorContextValue = {
  draft?: DraftControls
}

export const EditorContext = createContext<EditorContextValue>({})

export const useEditor = () => useContext(EditorContext)
