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
import { LuKey } from 'react-icons/lu'
import { getApiErrorMessage } from '~platform/api/client'
import { API_KEY_SCOPES, CreatedApiKey, useCreateApiKey } from '~platform/queries/apikeys'

// Keys default to full access; the admin can untick scopes to narrow them.
const ALL_SCOPES = API_KEY_SCOPES.map((s) => s.value)

/** Admin-only "create API key" action: label + scopes + optional expiry. The secret is shown once. */
export const CreateApiKeyButton = () => {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [scopes, setScopes] = useState<string[]>(ALL_SCOPES)
  const [expiresAt, setExpiresAt] = useState('')
  const [created, setCreated] = useState<CreatedApiKey | null>(null)
  const [error, setError] = useState<string | null>(null)
  const create = useCreateApiKey()

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
      setError('A label is required.')
      return
    }
    if (scopes.length === 0) {
      setError('Select at least one scope.')
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
      setError(getApiErrorMessage(err) ?? 'Could not create API key')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => (e.open ? setOpen(true) : close())} placement='center' size='lg'>
      <Dialog.Trigger asChild>
        <Button size='sm'>
          <Icon as={LuKey} />
          Create API key
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
              <Dialog.Title>{created ? 'API key created' : 'Create API key'}</Dialog.Title>
            </Dialog.Header>

            {created ? (
              <>
                <Dialog.Body>
                  <Stack gap={4}>
                    <Alert.Root status='warning'>
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Title>Copy your key now</Alert.Title>
                        <Alert.Description>
                          This is the only time the full secret is shown. Store it somewhere safe.
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
                            Copy
                          </Button>
                        </Clipboard.Trigger>
                      </Box>
                    </Clipboard.Root>
                  </Stack>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button onClick={close}>Done</Button>
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
                      <Field.Label>Label</Field.Label>
                      <Input placeholder='e.g. CI pipeline' value={label} onChange={(e) => setLabel(e.target.value)} />
                    </Field.Root>

                    <Fieldset.Root>
                      <Fieldset.Legend>Scopes</Fieldset.Legend>
                      <Stack gap={2} mt={1}>
                        {API_KEY_SCOPES.map((s) => (
                          <Checkbox.Root
                            key={s.value}
                            checked={scopes.includes(s.value)}
                            onCheckedChange={(e) => toggleScope(s.value, e.checked === true)}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>
                              <Text as='span' fontWeight='medium'>
                                {s.label}
                              </Text>
                              <Text as='span' color='fg.muted' fontSize='sm'>
                                {' '}
                                — {s.description}
                              </Text>
                            </Checkbox.Label>
                          </Checkbox.Root>
                        ))}
                      </Stack>
                    </Fieldset.Root>

                    <Field.Root>
                      <Field.Label>Expiry (optional)</Field.Label>
                      <Input type='date' value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                      <Field.HelperText>Leave empty for a key that never expires.</Field.HelperText>
                    </Field.Root>
                  </Stack>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button variant='ghost' onClick={close}>
                    Cancel
                  </Button>
                  <Button onClick={onSubmit} loading={create.isPending}>
                    Create API key
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
