import { Badge, Code, Stack, Table, Text } from '@chakra-ui/react'
import { ManagedOrganization } from '~platform/queries/integrator'

const formatDate = (value: string) => {
  if (!value) return '-'
  const date = new Date(value)
  return isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

const shortAddress = (address: string) =>
  address && address.length > 14 ? `${address.slice(0, 8)}…${address.slice(-4)}` : address

// A human label for the org: its given name, falling back to the website, then nothing (the
// address is always shown beneath, so an unnamed org still renders an identifier).
const orgName = (org: ManagedOrganization) => org.meta?.name?.trim() || org.website?.trim() || ''

const formatCount = (value?: number) => (value ?? 0).toLocaleString()

export const ManagedOrganizationsTable = ({ organizations }: { organizations: ManagedOrganization[] }) => (
  <Table.ScrollArea borderWidth='1px' borderRadius='md'>
    <Table.Root variant='outline' interactive>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Organization</Table.ColumnHeader>
          <Table.ColumnHeader textAlign='end'>Processes</Table.ColumnHeader>
          <Table.ColumnHeader textAlign='end'>Members</Table.ColumnHeader>
          <Table.ColumnHeader textAlign='end'>SMS</Table.ColumnHeader>
          <Table.ColumnHeader textAlign='end'>Emails</Table.ColumnHeader>
          <Table.ColumnHeader>Created</Table.ColumnHeader>
          <Table.ColumnHeader>Status</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {organizations.map((org) => {
          const name = orgName(org)
          return (
            <Table.Row key={org.address}>
              <Table.Cell>
                {name ? (
                  <Stack gap={0.5}>
                    <Text fontWeight='medium'>{name}</Text>
                    <Code fontSize='xs' color='fg.muted' title={org.address}>
                      {shortAddress(org.address)}
                    </Code>
                  </Stack>
                ) : (
                  <Code title={org.address}>{shortAddress(org.address)}</Code>
                )}
              </Table.Cell>
              <Table.Cell textAlign='end'>{formatCount(org.counters?.processes)}</Table.Cell>
              <Table.Cell textAlign='end'>{formatCount(org.counters?.users)}</Table.Cell>
              <Table.Cell textAlign='end'>{formatCount(org.counters?.sentSMS)}</Table.Cell>
              <Table.Cell textAlign='end'>{formatCount(org.counters?.sentEmails)}</Table.Cell>
              <Table.Cell>{formatDate(org.createdAt)}</Table.Cell>
              <Table.Cell>
                <Badge colorPalette={org.active ? 'green' : 'gray'} variant='subtle'>
                  {org.active ? 'Active' : 'Inactive'}
                </Badge>
              </Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table.Root>
  </Table.ScrollArea>
)
