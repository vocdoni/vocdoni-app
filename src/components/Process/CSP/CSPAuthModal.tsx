import { Button, CloseButton, Dialog, Portal } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-components'
import type { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { CspAuthProvider, useCspAuthContext, useOptionalCspAuthContext } from './CSPStepsProvider'
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

// Scopes one identify flow to its children. Mount it around every Identify
// button of a page so they all resume the same step: with one provider per
// button, closing the OTP modal and reopening it from a different button
// restarted the flow from scratch.
export const CspAuthSession = ({ children }: { children: ReactNode }) => {
  const { election } = useElection()

  // The v2 process read carries the census auth configuration inline
  // (CensusSpec.authFields/twoFaFields) — no separate census bundle fetch.
  const census = election?.census
  const censusData = census ? { authFields: census.authFields ?? [], twoFaFields: census.twoFaFields ?? [] } : null

  // Always mount the provider, even before the process loads: swapping it in
  // conditionally would change the element type around `children` and remount
  // the whole wrapped page once the election arrives.
  return (
    <CspAuthProvider censusData={censusData} processId={election?.id}>
      {children}
    </CspAuthProvider>
  )
}

export const CspAuth = () => {
  const { election } = useElection()
  const session = useOptionalCspAuthContext()

  if (!election) return null

  if (session) return <CspAuthModal />

  return (
    <CspAuthSession>
      <CspAuthModal />
    </CspAuthSession>
  )
}
