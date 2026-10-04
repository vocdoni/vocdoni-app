import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react'

type SupportChatControls = {
  // Bumped on every request, so the widget can react to repeated opens of an already-open chat
  openRequest: number
  openChat: () => void
}

const SupportChatControlsContext = createContext<SupportChatControls | null>(null)

/**
 * Lets any part of the dashboard open the floating support chat (e.g. a "Chat with us" link)
 * while the widget keeps owning its own state.
 */
export const SupportChatControlsProvider = ({ children }: PropsWithChildren) => {
  const [openRequest, setOpenRequest] = useState(0)
  const openChat = useCallback(() => setOpenRequest((count) => count + 1), [])
  const value = useMemo(() => ({ openRequest, openChat }), [openRequest, openChat])

  return <SupportChatControlsContext.Provider value={value}>{children}</SupportChatControlsContext.Provider>
}

/** `null` outside the dashboard shell, where there is no chat to open. */
export const useSupportChatControls = () => useContext(SupportChatControlsContext)
