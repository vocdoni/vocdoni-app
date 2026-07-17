import {
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Code,
  Flex,
  HStack,
  Icon,
  IconButton,
  SimpleGrid,
  Spinner,
  Stack,
  Table,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuTrash2 } from 'react-icons/lu'
import { getApiErrorMessage } from '~components/Auth/api'
import { DashboardBox } from '~components/Dashboard/Contents'
import DeleteModal from '~components/Modal/DeleteModal'
import { useToast } from '~components/Toast'
import { ApiKey, useApiKeys, useRevokeApiKey, useStatus } from '~src/queries/integrators'
import { CreateApiKeyButton } from './CreateApiKeyModal'

const formatDate = (value?: string) => {
  if (!value) return '—'
  const d = new Date(value)
  return isNaN(d.getTime()) ? value : d.toLocaleDateString()
}

/**
 * Mobile presentation of a single key: identity (label + status + revoke) first, then the prefix
 * and wrapped scope badges, with the low-priority dates in a compact grid at the bottom. Avoids
 * the two-axis scrolling a 7-column table forces on small screens.
 */
const ApiKeyCard = ({
  apiKey: k,
  status,
  revokeDisabled,
  onRevoke,
}: {
  apiKey: ApiKey
  status: { label: string; palette: string }
  revokeDisabled: boolean
  onRevoke: () => void
}) => {
  const { t } = useTranslation()

  return (
    <DashboardBox gap={3} justifyContent='flex-start' flexWrap='nowrap'>
      <Flex align='center' gap={2}>
        <Text fontWeight='bold' truncate>
          {k.label}
        </Text>
        <Badge colorPalette={status.palette} variant='subtle' flexShrink={0}>
          {status.label}
        </Badge>
        <IconButton
          aria-label={t('integrators.api_keys.revoke', { defaultValue: 'Revoke key' })}
          variant='ghost'
          size='xs'
          color='fg.error'
          ml='auto'
          disabled={revokeDisabled}
          onClick={onRevoke}
        >
          <Icon as={LuTrash2} />
        </IconButton>
      </Flex>
      <Box opacity={k.revoked ? 0.6 : 1}>
        <Code>{k.prefix}…</Code>
        <HStack gap={1} wrap='wrap' mt={3}>
          {k.scopes.map((sc) => (
            <Badge key={sc} variant='subtle'>
              {sc}
            </Badge>
          ))}
        </HStack>
        <SimpleGrid columns={2} gap={2} mt={3} pt={3} borderTop='1px solid' borderColor='table.border'>
          <Box>
            <Text fontSize='xs' color='texts.subtle'>
              {t('integrators.api_keys.last_used', { defaultValue: 'Last used' })}
            </Text>
            <Text fontSize='sm'>{formatDate(k.lastUsedAt)}</Text>
          </Box>
          <Box>
            <Text fontSize='xs' color='texts.subtle'>
              {t('integrators.api_keys.expires', { defaultValue: 'Expires' })}
            </Text>
            <Text fontSize='sm'>{formatDate(k.expiresAt)}</Text>
          </Box>
        </SimpleGrid>
      </Box>
    </DashboardBox>
  )
}

const ApiKeysPanel = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const keys = useApiKeys()
  const revoke = useRevokeApiKey()
  const status = useStatus()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null)

  const onRevoke = async () => {
    if (!keyToRevoke) return
    try {
      await revoke.mutateAsync({ id: keyToRevoke.id })
      toast({ type: 'success', title: t('integrators.api_keys.revoked', { defaultValue: 'API key revoked' }) })
      setKeyToRevoke(null)
    } catch (err) {
      toast({
        type: 'error',
        title: t('integrators.api_keys.revoke_error', { defaultValue: 'Could not revoke key' }),
        description: getApiErrorMessage(err),
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
    return (
      <Alert.Root status='error'>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>{t('integrators.api_keys.load_error', { defaultValue: "Couldn't load API keys" })}</Alert.Title>
          <Alert.Description>{getApiErrorMessage(keys.error)}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    )
  }

  const list = keys.data ?? []

  return (
    <Stack gap={5}>
      <Flex justify='space-between' align='center' gap={4} wrap='wrap'>
        <Text color='texts.subtle' fontSize='sm'>
          {t('integrators.api_keys.intro', {
            defaultValue:
              'Programmatic credentials for calling the API as this organization. Secrets are shown only once.',
          })}
        </Text>
        <CreateApiKeyButton />
      </Flex>

      {list.length === 0 ? (
        <Alert.Root status='info'>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{t('integrators.api_keys.empty_title', { defaultValue: 'No API keys yet' })}</Alert.Title>
            <Alert.Description>
              {t('integrators.api_keys.empty_description', {
                defaultValue: 'Create a key to access the API without signing in.',
              })}
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : isMobile ? (
        // Stacked cards on small screens: the 7-column table overflows horizontally on mobile.
        <Stack gap={3}>
          {list.map((k) => (
            <ApiKeyCard
              key={k.id}
              apiKey={k}
              status={status(k)}
              revokeDisabled={k.revoked || revoke.isPending}
              onRevoke={() => setKeyToRevoke(k)}
            />
          ))}
        </Stack>
      ) : (
        <Table.ScrollArea borderWidth='1px' borderRadius='md'>
          <Table.Root variant='outline'>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t('integrators.api_keys.label', { defaultValue: 'Label' })}</Table.ColumnHeader>
                <Table.ColumnHeader>{t('integrators.api_keys.key', { defaultValue: 'Key' })}</Table.ColumnHeader>
                <Table.ColumnHeader>
                  {t('integrators.api_keys.scopes_legend', { defaultValue: 'Scopes' })}
                </Table.ColumnHeader>
                <Table.ColumnHeader>
                  {t('integrators.api_keys.last_used', { defaultValue: 'Last used' })}
                </Table.ColumnHeader>
                <Table.ColumnHeader>
                  {t('integrators.api_keys.expires', { defaultValue: 'Expires' })}
                </Table.ColumnHeader>
                <Table.ColumnHeader>{t('integrators.api_keys.status', { defaultValue: 'Status' })}</Table.ColumnHeader>
                <Table.ColumnHeader textAlign='end'>
                  {t('integrators.api_keys.actions', { defaultValue: 'Actions' })}
                </Table.ColumnHeader>
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
                    <Table.Cell textAlign='end'>
                      <IconButton
                        aria-label={t('integrators.api_keys.revoke', { defaultValue: 'Revoke key' })}
                        variant='ghost'
                        size='sm'
                        color='fg.error'
                        disabled={k.revoked || revoke.isPending}
                        onClick={() => setKeyToRevoke(k)}
                      >
                        <Icon as={LuTrash2} />
                      </IconButton>
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      )}

      <DeleteModal
        title={t('integrators.api_keys.revoke_confirm_title', { defaultValue: 'Revoke API key?' })}
        subtitle={t('integrators.api_keys.revoke_confirm_description', {
          defaultValue:
            'This permanently disables "{{label}}". Any integration using it will stop working immediately.',
          label: keyToRevoke?.label,
        })}
        open={!!keyToRevoke}
        onOpenChange={({ open }) => !open && setKeyToRevoke(null)}
      >
        <Flex justifyContent='flex-end' mt={4} gap={2}>
          <Button variant='outline' onClick={() => setKeyToRevoke(null)}>
            {t('integrators.api_keys.revoke_cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button loading={revoke.isPending} colorPalette='red' onClick={onRevoke}>
            {t('integrators.api_keys.revoke_confirm', { defaultValue: 'Revoke' })}
          </Button>
        </Flex>
      </DeleteModal>
    </Stack>
  )
}

export default ApiKeysPanel
