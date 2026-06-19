import { Badge, Link, Table } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { generatePath, Link as RouterLink } from 'react-router-dom'
import RoutedPaginatedTableFooter from '~components/Pagination/PaginatedTableFooter'
import { ManagedOrganization } from '~queries/integrator'
import { Routes } from '~routes'

const formatDate = (value: string) => {
  if (!value) return '-'
  const date = new Date(value)
  return isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

const shortAddress = (address: string) =>
  address && address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address

const ManagedOrganizationRow = ({ organization }: { organization: ManagedOrganization }) => {
  const { t } = useTranslation()

  return (
    <Table.Row>
      <Table.Cell>
        <Link asChild _hover={{ textDecoration: 'underline' }} fontWeight='medium'>
          <RouterLink to={generatePath(Routes.organization, { address: organization.address })}>
            {shortAddress(organization.address)}
          </RouterLink>
        </Link>
      </Table.Cell>
      <Table.Cell>{organization.type || '-'}</Table.Cell>
      <Table.Cell>{organization.country || '-'}</Table.Cell>
      <Table.Cell>{formatDate(organization.createdAt)}</Table.Cell>
      <Table.Cell>
        {organization.active ? (
          <Badge colorPalette='green' variant='subtle'>
            {t('integrator.organizations.active', { defaultValue: 'Active' })}
          </Badge>
        ) : (
          <Badge colorPalette='gray' variant='subtle'>
            {t('integrator.organizations.inactive', { defaultValue: 'Inactive' })}
          </Badge>
        )}
      </Table.Cell>
    </Table.Row>
  )
}

export const ManagedOrganizationsTable = ({ organizations }: { organizations: ManagedOrganization[] }) => {
  const { t } = useTranslation()

  return (
    <Table.ScrollArea border='1px solid' borderColor='table.border' borderRadius='sm'>
      <Table.Root variant='outline'>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>
              {t('integrator.organizations.address', { defaultValue: 'Address' })}
            </Table.ColumnHeader>
            <Table.ColumnHeader>{t('integrator.organizations.type', { defaultValue: 'Type' })}</Table.ColumnHeader>
            <Table.ColumnHeader>
              {t('integrator.organizations.country', { defaultValue: 'Country' })}
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              {t('integrator.organizations.created_at', { defaultValue: 'Created' })}
            </Table.ColumnHeader>
            <Table.ColumnHeader>{t('integrator.organizations.status', { defaultValue: 'Status' })}</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {organizations.map((organization) => (
            <ManagedOrganizationRow key={organization.address} organization={organization} />
          ))}
        </Table.Body>
        <Table.Caption>
          <RoutedPaginatedTableFooter />
        </Table.Caption>
      </Table.Root>
    </Table.ScrollArea>
  )
}
