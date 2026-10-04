import { createContext, useContext } from 'react'

export type JobId = string | null

export type MembersPageContextValue = {
  /** The member import running in the background, if any */
  jobId: JobId
  setJobId: (jobId: JobId) => void
  /** Goes to the import page */
  openImport: () => void
  /** Opens the "Add person" sheet the page header owns */
  openAddPerson: () => void
}

const noop = () => undefined

const MembersPageContext = createContext<MembersPageContextValue>({
  jobId: null,
  setJobId: noop,
  openImport: noop,
  openAddPerson: noop,
})

export const MembersPageProvider = MembersPageContext.Provider

/** What the Members section header shares with its tabs: the import job and its two actions. */
export const useMembersPage = () => useContext(MembersPageContext)
