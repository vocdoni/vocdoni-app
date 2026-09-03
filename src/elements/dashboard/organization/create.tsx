import { useEffect, useState } from 'react'
import { To } from 'react-router'
import { DashboardContents } from '~components/Dashboard/Contents'
import { OrganizationCreate } from '~components/Organization/Create'
import { Routes } from '~src/router/routes'

const DashBoardCreateOrg = () => {
  const [onSuccessRoute, setOnSuccessRoute] = useState<To>(Routes.dashboard.base)

  // Set layout title and subtitle and back button
  useEffect(() => {
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
