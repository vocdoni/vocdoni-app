import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { To, useOutletContext } from 'react-router-dom'
import { DashboardContents } from '~components/Dashboard/Contents'
import { OrganizationCreate } from '~components/Organization/Create'
import { DashboardLayoutContext } from '~elements/LayoutDashboard'
import { Routes } from '~src/router/routes'

const DashBoardCreateOrg = () => {
  const { t } = useTranslation()
  const [onSuccessRoute, setOnSuccessRoute] = useState<To>(Routes.dashboard.base)
  const { setBreadcrumb } = useOutletContext<DashboardLayoutContext>()

  // Set layout title and subtitle and back button
  useEffect(() => {
    setBreadcrumb([
      {
        title: t('create_org.title', { defaultValue: 'Tell us about your organization' }),
        route: Routes.dashboard.organizationCreate,
      },
    ])
    if (window.history.state.idx) {
      setOnSuccessRoute(-1 as unknown)
    }
  }, [])

  return (
    <DashboardContents>
      <OrganizationCreate onSuccessRoute={onSuccessRoute} />
    </DashboardContents>
  )
}

export default DashBoardCreateOrg
