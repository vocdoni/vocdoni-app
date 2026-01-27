import { createContext, useContext, type ReactNode } from 'react'

const ActionsContext = createContext({})

export const ActionsProvider = ({ children }: { children: ReactNode }) => (
  <ActionsContext.Provider value={{}}>{children}</ActionsContext.Provider>
)

export const useActions = () => useContext(ActionsContext)
