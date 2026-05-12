import { Button, CloseButton, Dialog, Portal } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useElection } from '@vocdoni/react-components'
import { InvalidElection, PublishedElection } from '@vocdoni/sdk'
import { Trans, useTranslation } from 'react-i18next'
import { QueryKeys } from '~queries/keys'
import { CspAuthProvider, useCspAuthContext } from './CSPStepsProvider'
import { Step0Base } from './Step0'
import { Step1Base } from './Step1'

type CensusBundleData = {
  id: string
  census: {
    id: string
    orgAddress: string
    type: string
    size: number
    groupId: string
    published: {
      uri: string
      root: string
      createdAt: string
    }
    authFields: string[]
    twoFaFields: string[]
    createdAt: string
    updatedAt: string
  }
  orgAddress: string
  processes: null
}

const useCensusBundle = (censusURI?: string) => {
  return useQuery({
    queryKey: QueryKeys.census.bundle(censusURI),
    queryFn: async (): Promise<CensusBundleData> => {
      if (!censusURI) {
        throw new Error('Census URI is required')
      }

      const response = await fetch(censusURI)
      if (!response.ok) {
        throw new Error(`Failed to fetch census bundle: ${response.statusText}`)
      }

      const data = await response.json()
      return data as CensusBundleData
    },
    enabled: !!censusURI,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

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
