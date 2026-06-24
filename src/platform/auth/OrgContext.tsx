import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useProfile, UserOrganization } from '~platform/queries/profile'

const SELECTED_ORG_KEY = 'integratorSelectedOrg'

const normalize = (address?: string) => (address ? address.toLowerCase().replace(/^0x/, '') : '')

type OrgContextValue = {
  // Organizations the user can administer (admin or manager) — candidates for the integrator app.
  candidates: UserOrganization[]
  selectedAddress?: string
  setSelectedAddress: (address: string) => void
  role?: string
  isAdmin: boolean
  isLoading: boolean
}

const OrgContext = createContext<OrgContextValue | undefined>(undefined)

export const OrgProvider = ({ children }: PropsWithChildren) => {
  const { data: profile, isLoading } = useProfile()
  const [selected, setSelected] = useState<string | undefined>(
    () => localStorage.getItem(SELECTED_ORG_KEY) || undefined
  )

  const candidates = useMemo(
    () => (profile?.organizations ?? []).filter((o) => o.role === 'admin' || o.role === 'manager'),
    [profile]
  )

  // Resolve the active org: a previously selected one if still valid, otherwise the first candidate.
  const selectedAddress = useMemo(() => {
    if (!candidates.length) return undefined
    const match = candidates.find((o) => normalize(o.organization.address) === normalize(selected))
    return (match ?? candidates[0]).organization.address
  }, [candidates, selected])

  useEffect(() => {
    if (selectedAddress) localStorage.setItem(SELECTED_ORG_KEY, selectedAddress)
  }, [selectedAddress])

  const setSelectedAddress = useCallback((address: string) => setSelected(address), [])

  const current = candidates.find((o) => normalize(o.organization.address) === normalize(selectedAddress))

  const value = useMemo<OrgContextValue>(
    () => ({
      candidates,
      selectedAddress,
      setSelectedAddress,
      role: current?.role,
      isAdmin: current?.role === 'admin',
      isLoading,
    }),
    [candidates, selectedAddress, setSelectedAddress, current?.role, isLoading]
  )

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>
}

export const useOrg = () => {
  const context = useContext(OrgContext)
  if (!context) {
    throw new Error('useOrg must be used within an OrgProvider')
  }
  return context
}
