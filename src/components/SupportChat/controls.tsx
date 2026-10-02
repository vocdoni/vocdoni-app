import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react'

type SupportChatControls = {
  // Bumped on every request, so the widget can react to repeated opens of an already-open chat
  openRequest: number
  openChat: () => void
  // True while something that sits where the chat launcher does (e.g. a selection bar) is showing
  hidden?: boolean
  // Hides the chat until the returned release function runs. Requests stack: the chat comes back
  // once every one has been released.
  hideChat?: () => () => void
}

const SupportChatControlsContext = createContext<SupportChatControls | null>(null)

/**
 * Lets any part of the dashboard open the floating support chat (e.g. a "Chat with us" link), or
 * hide it for a while, while the widget keeps owning its own state.
 */
export const SupportChatControlsProvider = ({ children }: PropsWithChildren) => {
  const [openRequest, setOpenRequest] = useState(0)
  const [hideRequests, setHideRequests] = useState(0)
  const openChat = useCallback(() => setOpenRequest((count) => count + 1), [])
  const hideChat = useCallback(() => {
    setHideRequests((count) => count + 1)
    let released = false
    return () => {
      if (released) return
      released = true
      setHideRequests((count) => count - 1)
    }
  }, [])
  const hidden = hideRequests > 0
  const value = useMemo(() => ({ openRequest, openChat, hidden, hideChat }), [openRequest, openChat, hidden, hideChat])

  return <SupportChatControlsContext.Provider value={value}>{children}</SupportChatControlsContext.Provider>
}

/** `null` outside the dashboard shell, where there is no chat to open. */
export const useSupportChatControls = () => useContext(SupportChatControlsContext)
