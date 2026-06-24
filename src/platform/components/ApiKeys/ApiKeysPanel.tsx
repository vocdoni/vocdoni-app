import {
  Alert,
  Badge,
  Center,
  Code,
  Flex,
  HStack,
  IconButton,
  Icon,
  Spinner,
  Stack,
  Table,
  Text,
} from '@chakra-ui/react'
import { LuTrash2 } from 'react-icons/lu'
import { ApiError, getApiErrorMessage } from '~platform/api/client'
import { useOrg } from '~platform/auth/OrgContext'
import { toaster } from '~platform/components/ui/toaster'
import { ApiKey, useApiKeys, useRevokeApiKey } from '~platform/queries/apikeys'
import { CreateApiKeyButton } from './CreateApiKeyModal'

const formatDate = (value?: string) => {
  if (!value) return '—'
  const d = new Date(value)
  return isNaN(d.getTime()) ? value : d.toLocaleDateString()
}

const status = (k: ApiKey): { label: string; palette: string } => {
  if (k.revoked) return { label: 'Revoked', palette: 'red' }
  if (k.expiresAt && new Date(k.expiresAt).getTime() < Date.now()) return { label: 'Expired', palette: 'orange' }
  return { label: 'Active', palette: 'green' }
}

const ApiKeysPanel = () => {
  const { isAdmin } = useOrg()
  const keys = useApiKeys()
  const revoke = useRevokeApiKey()

  const onRevoke = async (k: ApiKey) => {
    try {
      await revoke.mutateAsync({ id: k.id })
      toaster.create({ type: 'success', title: 'API key revoked', closable: true })
    } catch (err) {
      toaster.create({
        type: 'error',
        title: 'Could not revoke key',
        description: getApiErrorMessage(err),
        closable: true,
      })
    }
  }

  if (keys.isLoading) {
    return (
      <Center py={12}>
        <Spinner />
      </Center>
    )
  }

  if (keys.error) {
    // The endpoint is admin-gated, so only treat 401/403 as "admin-only"; anything else
    // (e.g. the backend not yet exposing the endpoint) is a genuine load error.
    const httpStatus = keys.error instanceof ApiError ? keys.error.response?.status : undefined
    if (httpStatus === 401 || httpStatus === 403) {
      return (
        <Alert.Root status='info'>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>API keys are admin-only</Alert.Title>
            <Alert.Description>Only organization admins can view and manage API keys.</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )
    }
    return (
      <Alert.Root status='error'>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Couldn't load API keys</Alert.Title>
          <Alert.Description>{getApiErrorMessage(keys.error)}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    )
  }

  const list = keys.data ?? []

  return (
    <Stack gap={5}>
      <Flex justify='space-between' align='center' gap={4} wrap='wrap'>
        <Text color='fg.muted' fontSize='sm'>
          Programmatic credentials for calling the API as this organization. Secrets are shown only once.
        </Text>
        {isAdmin && <CreateApiKeyButton />}
      </Flex>

      {list.length === 0 ? (
        <Alert.Root status='info'>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>No API keys yet</Alert.Title>
            <Alert.Description>Create a key to access the API without signing in.</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : (
        <Table.ScrollArea borderWidth='1px' borderRadius='md'>
          <Table.Root variant='outline'>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Label</Table.ColumnHeader>
                <Table.ColumnHeader>Key</Table.ColumnHeader>
                <Table.ColumnHeader>Scopes</Table.ColumnHeader>
                <Table.ColumnHeader>Last used</Table.ColumnHeader>
                <Table.ColumnHeader>Expires</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                {isAdmin && <Table.ColumnHeader textAlign='end'>Actions</Table.ColumnHeader>}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {list.map((k) => {
                const s = status(k)
                return (
                  <Table.Row key={k.id}>
                    <Table.Cell>{k.label}</Table.Cell>
                    <Table.Cell>
                      <Code>{k.prefix}…</Code>
                    </Table.Cell>
                    <Table.Cell>
                      <HStack gap={1} wrap='wrap'>
                        {k.scopes.map((sc) => (
                          <Badge key={sc} variant='subtle'>
                            {sc}
                          </Badge>
                        ))}
                      </HStack>
                    </Table.Cell>
                    <Table.Cell>{formatDate(k.lastUsedAt)}</Table.Cell>
                    <Table.Cell>{formatDate(k.expiresAt)}</Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={s.palette} variant='subtle'>
                        {s.label}
                      </Badge>
                    </Table.Cell>
                    {isAdmin && (
                      <Table.Cell textAlign='end'>
                        <IconButton
                          aria-label='Revoke key'
                          variant='ghost'
                          size='sm'
                          color='fg.error'
                          disabled={k.revoked || revoke.isPending}
                          onClick={() => onRevoke(k)}
                        >
                          <Icon as={LuTrash2} />
                        </IconButton>
                      </Table.Cell>
                    )}
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      )}
    </Stack>
  )
}

export default ApiKeysPanel
