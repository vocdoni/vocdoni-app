import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router-dom'
import { AccountEdit } from '~components/Account/Edit'
import { DashboardContents } from '~components/Dashboard/Contents'
import { DashboardLayoutContext } from '~elements/LayoutDashboard'
import { Routes } from '~routes'

const Profile = () => {
  const { t } = useTranslation()
  const { setBreadcrumb } = useOutletContext<DashboardLayoutContext>()

  // Set layout variables
  useEffect(() => {
    setBreadcrumb([{ title: t('profile.title'), route: Routes.dashboard.profile }])
  }, [setBreadcrumb])

  return (
    <DashboardContents>
      <AccountEdit />
    </DashboardContents>
  )
}

export default Profile
