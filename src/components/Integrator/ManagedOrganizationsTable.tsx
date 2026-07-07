import { Badge, Code, Stack, Table, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { ManagedOrganization } from '~src/queries/integrators'

const formatDate = (value: string) => {
  if (!value) return '-'
  const date = new Date(value)
  return isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

const shortAddress = (address: string) =>
  address && address.length > 14 ? `${address.slice(0, 8)}…${address.slice(-4)}` : address

const formatCount = (value?: number) => (value ?? 0).toLocaleString()

export const ManagedOrganizationsTable = ({ organizations }: { organizations: ManagedOrganization[] }) => {
  const { t } = useTranslation()

  return (
    <Table.ScrollArea borderWidth='1px' borderRadius='md'>
      <Table.Root variant='outline' interactive>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>
              {t('integrators.managed.organization', { defaultValue: 'Organization' })}
            </Table.ColumnHeader>
            <Table.ColumnHeader textAlign='end'>
              {t('integrators.managed.processes', { defaultValue: 'Processes' })}
            </Table.ColumnHeader>
            <Table.ColumnHeader textAlign='end'>
              {t('integrators.managed.sms', { defaultValue: 'SMS' })}
            </Table.ColumnHeader>
            <Table.ColumnHeader textAlign='end'>
              {t('integrators.managed.emails', { defaultValue: 'Emails' })}
            </Table.ColumnHeader>
            <Table.ColumnHeader>{t('integrators.managed.created', { defaultValue: 'Created' })}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('integrators.managed.status', { defaultValue: 'Status' })}</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {organizations.map((org) => {
            const name = org.meta?.name?.trim() || org.website?.trim() || undefined
            return (
              <Table.Row key={org.address}>
                <Table.Cell>
                  {name ? (
                    <Stack gap={0.5}>
                      <Text fontWeight='medium'>{name}</Text>
                      <Code fontSize='xs' color='texts.subtle' title={org.address}>
                        {shortAddress(org.address)}
                      </Code>
                    </Stack>
                  ) : (
                    <Code title={org.address}>{shortAddress(org.address)}</Code>
                  )}
                </Table.Cell>
                <Table.Cell textAlign='end'>{formatCount(org.counters?.processes)}</Table.Cell>
                <Table.Cell textAlign='end'>{formatCount(org.counters?.sentSMS)}</Table.Cell>
                <Table.Cell textAlign='end'>{formatCount(org.counters?.sentEmails)}</Table.Cell>
                <Table.Cell>{formatDate(org.createdAt)}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={org.active ? 'green' : 'gray'} variant='subtle'>
                    {org.active
                      ? t('integrators.managed.active', { defaultValue: 'Active' })
                      : t('integrators.managed.inactive', { defaultValue: 'Inactive' })}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}
