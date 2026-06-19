import { Flex, Spinner } from '@chakra-ui/react'
import { Navigate, Outlet } from 'react-router-dom'
import { useIntegratorInfo } from '~queries/integrator'
import { Routes } from '~src/router/routes'

/**
 * Guards the integrator-only section of the dashboard. While the integrator status is being
 * resolved we show a spinner; organizations that are not integrators are bounced back to the
 * regular dashboard so they never see the integrator app.
 */
const IntegratorProtectedRoute = () => {
  const { data, isLoading } = useIntegratorInfo()

  if (isLoading) {
    return (
      <Flex flex='1 1 0' align='center' justify='center' p={10}>
        <Spinner />
      </Flex>
    )
  }

  if (!data?.enabled) {
    return <Navigate to={Routes.dashboard.base} replace />
  }

  return <Outlet />
}

export default IntegratorProtectedRoute
