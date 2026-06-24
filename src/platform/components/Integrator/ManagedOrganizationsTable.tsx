import { Badge, Code, Table } from '@chakra-ui/react'
import { ManagedOrganization } from '~platform/queries/integrator'

const formatDate = (value: string) => {
  if (!value) return '-'
  const date = new Date(value)
  return isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

const shortAddress = (address: string) =>
  address && address.length > 14 ? `${address.slice(0, 8)}…${address.slice(-4)}` : address

export const ManagedOrganizationsTable = ({ organizations }: { organizations: ManagedOrganization[] }) => (
  <Table.ScrollArea borderWidth='1px' borderRadius='md'>
    <Table.Root variant='outline' interactive>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Address</Table.ColumnHeader>
          <Table.ColumnHeader>Type</Table.ColumnHeader>
          <Table.ColumnHeader>Country</Table.ColumnHeader>
          <Table.ColumnHeader>Created</Table.ColumnHeader>
          <Table.ColumnHeader>Status</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {organizations.map((org) => (
          <Table.Row key={org.address}>
            <Table.Cell>
              <Code title={org.address}>{shortAddress(org.address)}</Code>
            </Table.Cell>
            <Table.Cell>{org.type || '-'}</Table.Cell>
            <Table.Cell>{org.country || '-'}</Table.Cell>
            <Table.Cell>{formatDate(org.createdAt)}</Table.Cell>
            <Table.Cell>
              <Badge colorPalette={org.active ? 'green' : 'gray'} variant='subtle'>
                {org.active ? 'Active' : 'Inactive'}
              </Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  </Table.ScrollArea>
)
