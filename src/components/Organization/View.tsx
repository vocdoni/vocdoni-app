import {
  AlertRoot as Alert,
  AlertDescription,
  AlertIndicator,
  Box,
  Flex,
  Grid,
  GridItem,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { useClient, useOrganization } from '@vocdoni/react-components'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ElectionsPageData } from '~src/ssr/public-pages'
import { useAuth } from '~components/Auth/useAuth'
import { QueryKeys } from '~queries/keys'
import { sameAddress } from '~utils/address'
import ProcessCardDetailed from '../Process/CardDetailed'
import Header from './Header'
import NoElections from './NoElections'

type OrganizationViewProps = {
  initialElectionsPage?: ElectionsPageData
}

const OrganizationView = ({ initialElectionsPage }: OrganizationViewProps) => {
  const { t } = useTranslation()
  const { client } = useClient()
  const queryClient = useQueryClient()
  const { currentAddress } = useAuth()
  const { organization, fetch } = useOrganization()

  const initialElections = (initialElectionsPage?.elections ?? []) as VotingProcessResponse[]
  const isFinishedFromInitialPage =
    !!initialElectionsPage &&
    (!initialElections.length ||
      initialElectionsPage.pagination.currentPage === initialElectionsPage.pagination.lastPage)

  const [electionsList, setElectionsList] = useState<VotingProcessResponse[]>(initialElections)
  const [loading, setLoading] = useState<boolean>(false)
  const [loaded, setLoaded] = useState<boolean>(!!initialElectionsPage)
  const [error, setError] = useState<string>()
  const [finished, setFinished] = useState<boolean>(isFinishedFromInitialPage)
  // we need refobserver to be in state to ensure the observer is assigned when rendering the ref layer
  // otherwise, the observer is not assigned and the intersection is not triggered
  const [refObserver, setRefObserver] = useState<HTMLDivElement | null>(null)

  // SAAS list pages are 1-based; 0 is the "nothing requested yet" sentinel.
  const [page, setPage] = useState<number>(initialElectionsPage ? 1 : 0)
  const previousOrganizationAddressRef = useRef<string | undefined>(organization?.address)
  useObserver(refObserver, setPage, setRefObserver)

  // refetch account info in case it changes in client (i.e. when editing the account profile in this same page)
  useEffect(() => {
    // only re-fetch if account is the same as the one rendered, otherwise it will load incorrect data
    if (!sameAddress(currentAddress, organization?.address)) return

    fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAddress])

  // resets fields on account change; also kicks off the first fetch once the
  // organization resolves in the client-rendered (no SSR page) path
  useEffect(() => {
    if (previousOrganizationAddressRef.current === organization?.address) return

    const isFirstResolution = previousOrganizationAddressRef.current === undefined
    previousOrganizationAddressRef.current = organization?.address

    // The SSR page already seeded page 1 for this organization; don't discard it.
    if (isFirstResolution && initialElectionsPage) return

    setElectionsList([])
    setFinished(isFinishedFromInitialPage)
    setPage(1)
    setLoaded(false)
    setLoading(false)
  }, [initialElectionsPage, isFinishedFromInitialPage, organization?.address])

  // loads elections. Note the load trigger is done via useObserver using a layer visibility.
  useEffect(() => {
    if (finished || loading || page === 0 || error || !organization?.address) return

    setLoading(true)

    client.elections
      .list({ orgAddress: organization.address, page })
      .then((res) => {
        const processes = res.processes
        if (!processes.length || res.pagination.currentPage === res.pagination.lastPage) {
          setFinished(true)
        }

        // Pre-seed each process into the ElectionProvider query so the per-card
        // providers render from cache instead of re-fetching.
        processes.forEach((process) => {
          queryClient.setQueryData(QueryKeys.election.process(process.id), process)
        })

        setElectionsList((prev) => [...prev, ...processes])
      })
      .catch((err) => {
        console.error('fetch elections error', err)
        setError(err.message)
        setFinished(true)
      })
      .finally(() => {
        setLoading(false)
        setLoaded(true)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, error, finished, organization?.address])

  return (
    <Box mb={44} mx='auto'>
      <Header />

      <Text as='h2' fontSize='heading-sm' fontWeight='bold' mb={4} textAlign={{ base: 'center', md: 'start' }}>
        {t('organization.elections')}
      </Text>

      <Grid templateColumns='repeat(auto-fill, minmax(350px, 1fr))' columnGap={{ base: 3, lg: 4 }} rowGap={12}>
        {electionsList?.map((election, idx) => (
          <GridItem key={idx} display='flex' justifyContent='center' alignItems='start'>
            <ProcessCardDetailed election={election} />
          </GridItem>
        ))}
        {/* we need to render only when loaded, to avoid loading pages when there's no content */}
        {loaded && <div className='ref-observer-buddy' ref={setRefObserver}></div>}
      </Grid>

      <Flex justifyContent='center' my={4}>
        {loading && <Spinner />}

        {loaded && !electionsList.length && <NoElections />}
      </Flex>
      {error && (
        <Alert status='error'>
          <AlertIndicator />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </Box>
  )
}

const useObserver = (
  refObserver: any,
  setPage: Dispatch<SetStateAction<number>>,
  setRefObserver: Dispatch<SetStateAction<HTMLDivElement | null>>
) => {
  useEffect(() => {
    if (!refObserver || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1)
        }
      },
      {
        threshold: 0.1,
      }
    )

    observer.observe(refObserver)

    return () => {
      if (refObserver) setRefObserver(null)
    }
  }, [refObserver, setPage])
}
export default OrganizationView
