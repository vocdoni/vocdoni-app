import { useRef } from 'react'
import { useLocation, useSearchParams } from 'react-router'
import { SidebarVisibilityProvider } from '~components/Dashboard/SidebarContext'
import { VoteEditor } from './VoteEditor'

export { useConfirmOnNavigate } from './useConfirmOnNavigate'
export { saveTimeoutMs, useFormDraftSaver } from './useFormDraftSaver'
export { useCreateProcess, useDraft } from './queries'
export { buildCensusSpec, useFormToVotingProcessRequest } from './request'

type EditorNavState = { editorNav?: boolean } | null

/**
 * Picks the editing session. Following any link here ("New vote", "Continue your draft", back and
 * forward) opens a fresh one; the editor moving its own URL along (a new draft's id) keeps it.
 * A plain "New vote" never reopens the last draft behind the user's back.
 */
export const ProcessCreate = () => {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const session = useRef<{ key: string; draftId: string | null } | null>(null)

  if (!session.current || !(location.state as EditorNavState)?.editorNav) {
    if (session.current?.key !== location.key) {
      session.current = { key: location.key, draftId: searchParams.get('draftId') }
    }
  }

  return (
    <SidebarVisibilityProvider>
      <VoteEditor key={session.current.key} draftId={session.current.draftId} />
    </SidebarVisibilityProvider>
  )
}

export default ProcessCreate
