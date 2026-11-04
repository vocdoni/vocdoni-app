import { Badge, Button, Code, Stack, Table, Text } from '@chakra-ui/react'
import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EditSpendCapDialog } from '~components/Integrator/EditSpendCapDialog'
import { ManagedOrganizationRow } from '~src/queries/integrators'
import { shortAddress } from '~utils/address'
import { currency } from '~utils/numbers'

const formatDate = (value: string) => {
  if (!value) return '-'
  const date = new Date(value)
  return isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

const formatCount = (value?: number) => (value ?? 0).toLocaleString()

type ManagedOrganizationsTableProps = {
  organizations: ManagedOrganizationRow[]
  // Integrator admins may edit the spend cap of each organization
  canEditCaps?: boolean
}

export const ManagedOrganizationsTable = ({ organizations, canEditCaps = false }: ManagedOrganizationsTableProps) => {
  const { t } = useTranslation()
  const [editing, setEditing] = useState<ManagedOrganizationRow | null>(null)
  // The spend columns and the cap editor only appear once the backend reports spend, so the table
  // looks unchanged against a backend without them.
  const showSpend = organizations.some((org) => org.spentCents !== undefined)
  const showEdit = showSpend && canEditCaps

  return (
    <Fragment>
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
              {showSpend && (
                <Table.ColumnHeader textAlign='end'>
                  {t('integrators.managed.spent', { defaultValue: 'Spent' })}
                </Table.ColumnHeader>
              )}
              {showSpend && (
                <Table.ColumnHeader textAlign='end'>
                  {t('integrators.managed.spend_cap', { defaultValue: 'Spend cap' })}
                </Table.ColumnHeader>
              )}
              <Table.ColumnHeader>{t('integrators.managed.created', { defaultValue: 'Created' })}</Table.ColumnHeader>
              {showEdit && (
                <Table.ColumnHeader>{t('integrators.managed.actions', { defaultValue: 'Actions' })}</Table.ColumnHeader>
              )}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {organizations.map((org) => {
              const name = org.name?.default?.trim() || org.website?.trim() || undefined
              const capReached =
                org.spendCapCents != null && org.spentCents != null && org.spentCents >= org.spendCapCents
              return (
                <Table.Row key={org.address} bg={capReached ? 'orange.subtle' : undefined}>
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
                  {showSpend && <Table.Cell textAlign='end'>{currency(org.spentCents ?? 0)}</Table.Cell>}
                  {showSpend && (
                    <Table.Cell textAlign='end'>
                      <Stack gap={1} align='flex-end'>
                        <Text>
                          {org.spendCapCents == null
                            ? t('integrators.managed.no_cap', { defaultValue: 'No cap' })
                            : currency(org.spendCapCents)}
                        </Text>
                        {capReached && (
                          <Badge colorPalette='orange' variant='subtle'>
                            {t('integrators.managed.cap_reached', { defaultValue: 'Cap reached' })}
                          </Badge>
                        )}
                      </Stack>
                    </Table.Cell>
                  )}
                  <Table.Cell>{formatDate(org.createdAt)}</Table.Cell>
                  {showEdit && (
                    <Table.Cell>
                      <Button size='xs' variant='outline' onClick={() => setEditing(org)}>
                        {t('integrators.managed.edit_cap', { defaultValue: 'Edit cap' })}
                      </Button>
                    </Table.Cell>
                  )}
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      {showEdit && <EditSpendCapDialog organization={editing} onClose={() => setEditing(null)} />}
    </Fragment>
  )
}
