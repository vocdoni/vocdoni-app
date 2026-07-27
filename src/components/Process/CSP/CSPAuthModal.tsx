import { Button, CloseButton, Dialog, Portal } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-components'
import { Trans, useTranslation } from 'react-i18next'
import { CspAuthProvider, useCspAuthContext } from './CSPStepsProvider'
import { Step0Base } from './Step0'
import { Step1Base } from './Step1'

export const CspAuthModal = () => {
  const { t } = useTranslation()
  const { currentStep } = useCspAuthContext()

  return (
    <Dialog.Root size='sm'>
      <Dialog.Trigger asChild>
        <Button w='full' aria-label={t('spreadsheet.access_button', { defaultValue: 'Login' })}>
          <Trans i18nKey='spreadsheet.access_button'>Login</Trans>
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner display='flex' alignItems='center' justifyContent='center' p={{ base: 4, md: 6 }}>
          <Dialog.Content w='full' maxW='lg'>
            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
            <Dialog.Header>
              <Dialog.Title>
                <Trans i18nKey='csp.step1.title'>Authentication</Trans>
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>{currentStep === 0 ? <Step0Base /> : <Step1Base />}</Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export const CspAuth = () => {
  const { election } = useElection()

  if (!election) return null

  // The v2 process read carries the census auth configuration inline
  // (CensusSpec.authFields/twoFaFields) — no separate census bundle fetch.
  return (
    <CspAuthProvider
      censusData={{
        authFields: election.census?.authFields ?? [],
        twoFaFields: election.census?.twoFaFields ?? [],
      }}
    >
      <CspAuthModal />
    </CspAuthProvider>
  )
}
