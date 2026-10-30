import { RoutedPaginationProvider } from '@vocdoni/react-components'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'
import { ListStateAlert } from '~components/ui/ListStateAlert'
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
      {
        label: t('members.fields.password', { defaultValue: 'Password' }),
        id: 'password',
        visible: false,
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
  // An empty list is the table's own empty state; only a failure gets an alert.
  const hasError = !!error && !(isLoading || isFetching)

  return (
    <TableProvider data={members} initialColumns={columns} loading={isLoading} isFetching={isFetching} error={error}>
      <RoutedPaginationProvider path={Routes.dashboard.memberbase.members} pagination={pagination}>
        <ListStateAlert
          show={hasError}
          title={t('members.list.error', { defaultValue: 'Unable to load members' })}
          error={error}
        />
        <MembersTable />
      </RoutedPaginationProvider>
    </TableProvider>
  )
}

export default Members
