import { Button, CloseButton, Dialog, Portal } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-components'
import { InvalidElection, PublishedElection } from '@vocdoni/sdk'
import { Trans, useTranslation } from 'react-i18next'
import { useCensusBundle } from '~queries/census'
import { CspAuthProvider, useCspAuthContext } from './CSPStepsProvider'
import { Step0Base } from './Step0'
import { Step1Base } from './Step1'

export const CspAuthModal = () => {
  const { t } = useTranslation()
  const { election } = useElection()
  const { currentStep } = useCspAuthContext()

  if (election instanceof InvalidElection) return null

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
            <Dialog.Body>
              {currentStep === 0 ? (
                <Step0Base election={election as PublishedElection} />
              ) : (
                <Step1Base election={election as PublishedElection} />
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export const CspAuth = () => {
  const { election } = useElection()
  const {
    data: censusData,
    isLoading,
    error,
  } = useCensusBundle(election instanceof PublishedElection ? election.census.censusURI : undefined)

  if (election instanceof InvalidElection) return null
  if (isLoading) return <div>Loading census data...</div>
  if (error) return <div>Error loading census data: {error.message}</div>

  const processedCensusData = censusData
    ? {
        authFields: censusData.census.authFields,
        twoFaFields: censusData.census.twoFaFields,
      }
    : null

  return (
    <CspAuthProvider censusData={processedCensusData}>
      <CspAuthModal />
    </CspAuthProvider>
  )
}
