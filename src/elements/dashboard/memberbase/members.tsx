import { RoutedPaginationProvider } from '@vocdoni/react-components'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'
import { ListStateAlert } from '~components/Feedback/ListStateAlert'
import { MemberbaseTabsContext } from '~components/Memberbase'
import MembersTable from '~components/Memberbase/Members'
import { TableProvider } from '~components/Memberbase/TableProvider'
import { Routes } from '~routes'
import { usePaginatedMembers } from '~src/queries/members'

export const useMemberColumns = () => {
  const { t } = useTranslation()

  return useMemo(
    () => [
      {
        label: t('members.fields.firstname', { defaultValue: 'First Name' }),
        id: 'name',
      },
      {
        label: t('members.fields.surname', { defaultValue: 'Last Name' }),
        id: 'surname',
      },
      {
        label: t('members.fields.email', { defaultValue: 'Email' }),
        is2fa: true,
        id: 'email',
      },
      {
        label: t('members.fields.phone', { defaultValue: 'Phone' }),
        is2fa: true,
        id: 'phone',
      },
      {
        label: t('members.fields.member_number', { defaultValue: 'Member Number' }),
        id: 'memberNumber',
      },
      {
        label: t('members.fields.national_id', { defaultValue: 'National ID' }),
        id: 'nationalId',
        visible: false,
      },
      {
        label: t('members.fields.birth_date', { defaultValue: 'Birth Date' }),
        id: 'birthDate',
        visible: false,
      },
      {
        label: t('members.fields.weight', { defaultValue: 'Voting power (Weight)' }),
        id: 'weight',
        visible: true,
      },
    ],
    [t]
  )
}

const Members = () => {
  const { t } = useTranslation()
  const columns = useMemberColumns()
  const { debouncedSearch } = useOutletContext<MemberbaseTabsContext>()
  const { data, isLoading, isFetching, error } = usePaginatedMembers({ search: debouncedSearch })

  const members = data?.members || []
  const pagination = data?.pagination || {
    totalItems: 0,
    currentPage: 0,
    lastPage: 0,
    previousPage: null,
    nextPage: null,
  }
  const isLoadingOrFetching = isLoading || isFetching
  const hasError = !!error && !isLoadingOrFetching
  const isEmpty = members.length === 0 && !isLoadingOrFetching && !hasError
  const hasSearch = Boolean(debouncedSearch)
  const showAlert = hasError || isEmpty
  const alertStatus = hasError ? 'error' : 'info'
  const alertTitle = hasError
    ? t('members.list.error', { defaultValue: 'Unable to load members' })
    : hasSearch
      ? t('members.list.no_search_results', { defaultValue: 'No members match your search' })
      : t('members.list.empty', { defaultValue: 'No members found' })
  const alertDescription = hasError
    ? error?.message?.toString()
    : hasSearch
      ? t('members.list.no_search_results_description', {
          defaultValue: 'Try adjusting your search terms.',
        })
      : t('members.list.empty_description', {
          defaultValue: 'Add your first member to get started.',
        })

  return (
    <TableProvider data={members} initialColumns={columns} isLoading={isLoading} isFetching={isFetching} error={error}>
      <RoutedPaginationProvider path={Routes.dashboard.memberbase.members} pagination={pagination}>
        {showAlert && <ListStateAlert show status={alertStatus} title={alertTitle} description={alertDescription} />}
        <MembersTable />
      </RoutedPaginationProvider>
    </TableProvider>
  )
}

export default Members
