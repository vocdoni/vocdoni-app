import { useBreakpointValue } from '@chakra-ui/react'
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type SidebarVisibilityContextValue = {
  showSidebar: boolean
  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void
}

const SidebarVisibilityContext = createContext<SidebarVisibilityContextValue | undefined>(undefined)

export const SidebarVisibilityProvider = ({ children }: { children: ReactNode }) => {
  const isDesktop = useBreakpointValue({ base: false, md: true })
  const [showSidebar, setShowSidebar] = useState<boolean>(() => Boolean(isDesktop))

  useEffect(() => {
    if (typeof isDesktop === 'boolean') {
      setShowSidebar(isDesktop)
    }
  }, [isDesktop])

  const openSidebar = useCallback(() => setShowSidebar(true), [])
  const closeSidebar = useCallback(() => setShowSidebar(false), [])
  const toggleSidebar = useCallback(() => setShowSidebar((prev) => !prev), [])

  const value = useMemo(
    () => ({
      showSidebar,
      openSidebar,
      closeSidebar,
      toggleSidebar,
    }),
    [showSidebar, openSidebar, closeSidebar, toggleSidebar]
  )

  return <SidebarVisibilityContext.Provider value={value}>{children}</SidebarVisibilityContext.Provider>
}

export const useSidebarVisibility = () => {
  const context = useContext(SidebarVisibilityContext)
  if (!context) {
    throw new Error('useSidebarVisibility must be used within a SidebarVisibilityProvider')
  }
  return context
}
