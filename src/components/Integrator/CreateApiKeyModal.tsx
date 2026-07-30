import {
  Alert,
  Box,
  Button,
  Checkbox,
  Clipboard,
  CloseButton,
  Code,
  Dialog,
  Field,
  Fieldset,
  Icon,
  Input,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useState } from 'react'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { LuKey } from 'react-icons/lu'
import { getApiErrorMessage } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { API_KEY_SCOPES, CreatedApiKey, useCreateApiKey } from '~src/queries/integrators'

// Keys default to full access; the admin can untick scopes to narrow them.
const ALL_SCOPES = [...API_KEY_SCOPES]

// Literal t() calls (not dynamic keys) so the i18n extractor picks up each scope's copy.
const scopeMeta = (scope: (typeof API_KEY_SCOPES)[number], t: TFunction): { label: string; description: string } => {
  switch (scope) {
    case 'quota:read':
      return {
        label: t('integrators.api_keys.scopes.quota_read', { defaultValue: 'Read quota' }),
        description: t('integrators.api_keys.scopes.quota_read_desc', {
          defaultValue: 'Read integrator quota and usage',
        }),
      }
    case 'managed:read':
      return {
        label: t('integrators.api_keys.scopes.managed_read', { defaultValue: 'List managed orgs' }),
        description: t('integrators.api_keys.scopes.managed_read_desc', {
          defaultValue: 'List managed organizations',
        }),
      }
    case 'managed:write':
      return {
        label: t('integrators.api_keys.scopes.managed_write', { defaultValue: 'Create managed orgs' }),
        description: t('integrators.api_keys.scopes.managed_write_desc', {
          defaultValue: 'Create managed organizations',
        }),
      }
    case 'voting:write':
      return {
        label: t('integrators.api_keys.scopes.voting_write', { defaultValue: 'Manage voting' }),
        description: t('integrators.api_keys.scopes.voting_write_desc', {
          defaultValue: 'Create and publish processes, censuses and bundles',
        }),
      }
    case 'members:write':
      return {
        label: t('integrators.api_keys.scopes.members_write', { defaultValue: 'Manage members' }),
        description: t('integrators.api_keys.scopes.members_write_desc', {
          defaultValue: 'Manage members and groups',
        }),
      }
  }
}

/** "Create API key" action: label + scopes + optional expiry. The secret is shown once. */
export const CreateApiKeyButton = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [scopes, setScopes] = useState<string[]>(ALL_SCOPES)
  const [expiresAt, setExpiresAt] = useState('')
  const [created, setCreated] = useState<CreatedApiKey | null>(null)
  const [error, setError] = useState<string | null>(null)
  const create = useCreateApiKey()
  const { currentAddress } = useAuth()

  const reset = () => {
    setLabel('')
    setScopes(ALL_SCOPES)
    setExpiresAt('')
    setCreated(null)
    setError(null)
  }

  const close = () => {
    setOpen(false)
    reset()
  }

  const toggleScope = (scope: string, checked: boolean) =>
    setScopes((prev) => (checked ? [...new Set([...prev, scope])] : prev.filter((s) => s !== scope)))

  const onSubmit = async () => {
    setError(null)
    if (!label.trim()) {
      setError(t('integrators.api_keys.error_label_required', { defaultValue: 'A label is required.' }))
      return
    }
    if (scopes.length === 0) {
      setError(t('integrators.api_keys.error_scope_required', { defaultValue: 'Select at least one scope.' }))
      return
    }
    try {
      const result = await create.mutateAsync({
        label: label.trim(),
        scopes,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      })
      setCreated(result)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => (e.open ? setOpen(true) : close())} placement='center' size='lg'>
      <Dialog.Trigger asChild>
        {/* Creating scopes the request to the active org, so keep it shut until one is selected. */}
        <Button size='sm' disabled={!currentAddress}>
          <Icon as={LuKey} />
          {t('integrators.api_keys.create', { defaultValue: 'Create API key' })}
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
            <Dialog.Header>
              <Dialog.Title>
                {created
                  ? t('integrators.api_keys.created_title', { defaultValue: 'API key created' })
                  : t('integrators.api_keys.create', { defaultValue: 'Create API key' })}
              </Dialog.Title>
            </Dialog.Header>

            {created ? (
              <>
                <Dialog.Body>
                  <Stack gap={4}>
                    <Alert.Root status='warning'>
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Title>
                          {t('integrators.api_keys.copy_now_title', { defaultValue: 'Copy your key now' })}
                        </Alert.Title>
                        <Alert.Description>
                          {t('integrators.api_keys.copy_now_description', {
                            defaultValue: 'This is the only time the full secret is shown. Store it somewhere safe.',
                          })}
                        </Alert.Description>
                      </Alert.Content>
                    </Alert.Root>
                    <Clipboard.Root value={created.secret}>
                      <Box borderWidth='1px' borderRadius='md' p={3} display='flex' alignItems='center' gap={3}>
                        <Code flex='1' overflowX='auto' whiteSpace='nowrap'>
                          {created.secret}
                        </Code>
                        <Clipboard.Trigger asChild>
                          <Button size='xs' variant='subtle'>
                            <Clipboard.Indicator />
                            {t('integrators.api_keys.copy', { defaultValue: 'Copy' })}
                          </Button>
                        </Clipboard.Trigger>
                      </Box>
                    </Clipboard.Root>
                  </Stack>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button onClick={close}>{t('integrators.api_keys.done', { defaultValue: 'Done' })}</Button>
                </Dialog.Footer>
              </>
            ) : (
              <>
                <Dialog.Body>
                  <Stack gap={4}>
                    {error && (
                      <Alert.Root status='error'>
                        <Alert.Indicator />
                        <Alert.Title>{error}</Alert.Title>
                      </Alert.Root>
                    )}
                    <Field.Root required>
                      <Field.Label>{t('integrators.api_keys.label', { defaultValue: 'Label' })}</Field.Label>
                      <Input
                        placeholder={t('integrators.api_keys.label_placeholder', { defaultValue: 'e.g. CI pipeline' })}
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                      />
                    </Field.Root>

                    <Fieldset.Root>
                      <Fieldset.Legend>
                        {t('integrators.api_keys.scopes_legend', { defaultValue: 'Scopes' })}
                      </Fieldset.Legend>
                      <Stack gap={2} mt={1}>
                        {API_KEY_SCOPES.map((scope) => {
                          const meta = scopeMeta(scope, t)
                          return (
                            <Checkbox.Root
                              key={scope}
                              checked={scopes.includes(scope)}
                              onCheckedChange={(e) => toggleScope(scope, e.checked === true)}
                            >
                              <Checkbox.HiddenInput />
                              <Checkbox.Control />
                              <Checkbox.Label>
                                <Text as='span' fontWeight='medium'>
                                  {meta.label}
                                </Text>
                                <Text as='span' color='texts.subtle' fontSize='sm'>
                                  {' '}
                                  — {meta.description}
                                </Text>
                              </Checkbox.Label>
                            </Checkbox.Root>
                          )
                        })}
                      </Stack>
                    </Fieldset.Root>

                    <Field.Root>
                      <Field.Label>
                        {t('integrators.api_keys.expiry', { defaultValue: 'Expiry (optional)' })}
                      </Field.Label>
                      <Input type='date' value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                      <Field.HelperText>
                        {t('integrators.api_keys.expiry_help', {
                          defaultValue: 'Leave empty for a key that never expires.',
                        })}
                      </Field.HelperText>
                    </Field.Root>
                  </Stack>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button variant='ghost' onClick={close}>
                    {t('cancel', { defaultValue: 'Cancel' })}
                  </Button>
                  <Button onClick={onSubmit} loading={create.isPending}>
                    {t('integrators.api_keys.create', { defaultValue: 'Create API key' })}
                  </Button>
                </Dialog.Footer>
              </>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
