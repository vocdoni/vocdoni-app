import { Alert, Button, Checkbox, CloseButton, Dialog, Field, Flex, Input, Portal, Stack } from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getApiErrorMessage } from '~components/Auth/api'
import { ManagedOrganizationRow, useUpdateManagedOrganization } from '~src/queries/integrators'
import { parseEuroAmountCents } from '~utils/numbers'

type EditSpendCapDialogProps = {
  organization: ManagedOrganizationRow | null
  onClose: () => void
}

/** Sets the spend cap of a managed organization in EUR. Ticking "No cap" sends `null` (lifts the cap). */
export const EditSpendCapDialog = ({ organization, onClose }: EditSpendCapDialogProps) => {
  const { t } = useTranslation()

  return (
    <Dialog.Root open={!!organization} onOpenChange={(e) => !e.open && onClose()} placement='center' size='md'>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
            <Dialog.Header>
              <Dialog.Title>{t('integrators.managed.edit_cap_title', { defaultValue: 'Edit spend cap' })}</Dialog.Title>
            </Dialog.Header>
            {/* Keyed so the form starts from the organization it was opened for */}
            {organization && <SpendCapForm key={organization.address} organization={organization} onDone={onClose} />}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

const SpendCapForm = ({ organization, onDone }: { organization: ManagedOrganizationRow; onDone: () => void }) => {
  const { t } = useTranslation()
  const update = useUpdateManagedOrganization()
  const currentCap = organization.spendCapCents ?? null
  const [amount, setAmount] = useState(currentCap === null ? '' : String(currentCap / 100))
  const [noCap, setNoCap] = useState(currentCap === null)
  const [error, setError] = useState<string | undefined>()

  const onSubmit = async () => {
    let spendCapCents: number | null = null
    if (!noCap) {
      spendCapCents = parseEuroAmountCents(amount)
      if (spendCapCents === null) {
        setError(
          t('integrators.managed.cap_invalid', {
            defaultValue: 'Enter an amount of 0 or more, with at most 2 decimals.',
          })
        )
        return
      }
    }

    setError(undefined)
    try {
      await update.mutateAsync({ address: organization.address, spendCapCents })
      onDone()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  return (
    <>
      <Dialog.Body>
        <Stack gap={4}>
          {error && (
            <Alert.Root status='error'>
              <Alert.Indicator />
              <Alert.Title>{error}</Alert.Title>
            </Alert.Root>
          )}
          <Field.Root disabled={noCap}>
            <Field.Label>
              {t('integrators.managed.cap_amount', { defaultValue: 'Cap (EUR, VAT excluded)' })}
            </Field.Label>
            <Input
              type='number'
              inputMode='decimal'
              step='0.01'
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Field.HelperText>
              {t('integrators.managed.cap_hint', {
                defaultValue:
                  "What this organization's voting processes may hold charged from your wallet, VAT excluded. Lowering it below what is already spent only blocks new charges.",
              })}
            </Field.HelperText>
          </Field.Root>
          <Checkbox.Root checked={noCap} onCheckedChange={(e) => setNoCap(e.checked === true)}>
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>{t('integrators.managed.no_cap', { defaultValue: 'No cap' })}</Checkbox.Label>
          </Checkbox.Root>
        </Stack>
      </Dialog.Body>
      <Dialog.Footer>
        <Flex justify='flex-end' gap={3} w='full'>
          <Button variant='ghost' onClick={onDone}>
            {t('cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button onClick={onSubmit} loading={update.isPending}>
            {t('integrators.managed.save_cap', { defaultValue: 'Save' })}
          </Button>
        </Flex>
      </Dialog.Footer>
    </>
  )
}
