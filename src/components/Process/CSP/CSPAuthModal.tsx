import {
  Button,
  ButtonProps,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useElection } from '@vocdoni/react-providers'
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

export const CspAuthModal = (props: ButtonProps) => {
  const { t } = useTranslation()
  const { isOpen, onClose, onOpen } = useDisclosure()
  const { election } = useElection()
  const { currentStep, setAuthData, setCurrentStep } = useCspAuthContext()

  if (election instanceof InvalidElection) return null

  const resetAuthState = () => {
    setCurrentStep(0)
    setAuthData({})
  }

  const handleClose = () => {
    resetAuthState()
    onClose()
  }

  return (
    <>
      <Button
        onClick={onOpen}
        w='full'
        aria-label={t('cc.spreadsheet.access_button', { defaultValue: 'Login' })}
        {...props}
      >
        <Trans i18nKey='cc.spreadsheet.access_button'>Login</Trans>
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign='center'>
            <Heading>
              <Trans i18nKey='csp.title'>Authentication</Trans>
            </Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {currentStep === 0 ? (
              <Step0Base election={election as PublishedElection} onAuthSuccess={handleClose} />
            ) : (
              <Step1Base election={election as PublishedElection} onAuthSuccess={handleClose} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export const CspAuth = (props: ButtonProps) => {
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
      <CspAuthModal {...props} />
    </CspAuthProvider>
  )
}
