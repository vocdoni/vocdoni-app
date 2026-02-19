import { useSaasAccount } from '~components/Account/SaasAccountProvider'
import QueryDataLayout from '~components/Layout/QueryDataLayout'
import EditOrganization from '~components/Organization/Edit'

const OrganizationEdit = () => {
  const { isLoading, isError, error } = useSaasAccount()

  return (
    <QueryDataLayout isLoading={isLoading} isError={isError} error={error}>
      <EditOrganization />
    </QueryDataLayout>
  )
}

export default OrganizationEdit
