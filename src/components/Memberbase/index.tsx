import { TabsList, TabsRoot, TabsTrigger } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Heading, SubHeading } from '~components/Dashboard/Contents'
import { Routes } from '~routes'

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
  const navigate = useNavigate()
  const location = useLocation()
  const [jobId, setJobIdState] = useState<JobId>(() => localStorage.getItem('memberbaseImportJobId'))
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const menuItems = [
    {
      label: t('memberbase.members.title', { defaultValue: 'Members' }),
      route: generatePath(Routes.dashboard.memberbase.members, { page: 1 }),
    },
    { label: t('memberbase.groups.title', { defaultValue: 'Groups' }), route: Routes.dashboard.memberbase.groups },
  ]
  const currentTabIndex = menuItems.findIndex((item) => location.pathname.endsWith(item.route))
  const activeTabValue = currentTabIndex === -1 ? menuItems[0]?.route : menuItems[currentTabIndex]?.route

  const submitSearch = () => {
    setDebouncedSearch(search)
  }

  const setJobId = (newJobId: string | null) => {
    if (newJobId) {
      localStorage.setItem('memberbaseImportJobId', newJobId)
    } else {
      localStorage.removeItem('memberbaseImportJobId')
    }
    setJobIdState(newJobId)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  return (
    <>
      <Heading>
        {t('memberbase.title', {
          defaultValue: 'Memberbase',
        })}
      </Heading>
      <SubHeading>
        {t('memberbase.subtitle', {
          defaultValue: "Manage your organization's members and create groups",
        })}
      </SubHeading>
      <TabsRoot
        variant='settings'
        value={activeTabValue}
        onValueChange={({ value }) => {
          const item = menuItems.find((entry) => entry.route === value)
          if (item) navigate(item.route)
        }}
        lazyMount
      >
        <TabsList mb={6}>
          {menuItems.map((item) => (
            <TabsTrigger key={item.route} value={item.route}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <Outlet context={{ setJobId, jobId, search, setSearch, debouncedSearch, submitSearch }} />
      </TabsRoot>
    </>
  )
}
