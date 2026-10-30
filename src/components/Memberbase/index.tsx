import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath } from 'react-router'
import { LocalStorageKeys } from '~components/Auth/useAuthProvider'
import { useAuth } from '~components/Auth/useAuth'
import { PageSubtitle, PageTitle } from '~components/ui/PageTitle'
import { RoutedTabs, type RoutedTab } from '~components/ui/RoutedTabs'
import { Routes } from '~routes'
import { usePaginatedMembers } from '~src/queries/members'
import { getStoredImportJobId, setStoredImportJobId } from './importJobStorage'

export type MemberbaseTabsContext = {
  setJobId: (jobId: JobId) => void
  jobId: JobId
  search: string
  setSearch: (search: string) => void
  debouncedSearch: string
  submitSearch: () => void
}

export type JobId = string | null

export const MemberbaseTabs = () => {
  const { t } = useTranslation()
  const { currentAddress } = useAuth()
  const accountId = currentAddress || localStorage.getItem(LocalStorageKeys.SignerAddress)
  const [jobId, setJobIdState] = useState<JobId>(() => getStoredImportJobId(accountId))
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  // Unfiltered total: this query never carries the search term, so the badge keeps showing the
  // whole memberbase while the table is filtered.
  const { data: allMembersData } = usePaginatedMembers({ showAll: true })
  const menuItems: RoutedTab[] = [
    {
      label: t('memberbase.members.title', { defaultValue: 'Members' }),
      route: generatePath(Routes.dashboard.memberbase.members, { page: '1' }),
      count: allMembersData?.pagination?.totalItems,
    },
    { label: t('memberbase.groups.title', { defaultValue: 'Groups' }), route: Routes.dashboard.memberbase.groups },
  ]
  const submitSearch = () => {
    setDebouncedSearch(search)
  }

  const setJobId = (newJobId: string | null) => {
    setStoredImportJobId(newJobId, accountId)
    setJobIdState(newJobId)
  }

  useEffect(() => {
    setJobIdState(getStoredImportJobId(accountId))
  }, [accountId])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  return (
    <>
      <PageTitle>
        {t('memberbase.title', {
          defaultValue: 'Memberbase',
        })}
      </PageTitle>
      <PageSubtitle>
        {t('memberbase.subtitle', {
          defaultValue: "Manage your organization's members and create groups",
        })}
      </PageSubtitle>
      <RoutedTabs
        tabs={menuItems}
        outletContext={{ setJobId, jobId, search, setSearch, debouncedSearch, submitSearch }}
      />
    </>
  )
}
