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
import { useClient, useOrganization } from '@vocdoni/react-providers'
import { areEqualHexStrings, InvalidElection, PublishedElection } from '@vocdoni/sdk'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ProcessCardDetailed from '../Process/CardDetailed'
import Header from './Header'
import NoElections from './NoElections'

const OrganizationView = () => {
  const { t } = useTranslation()
  const { client, account } = useClient()
  const { organization, fetch } = useOrganization()

  const [electionsList, setElectionsList] = useState<(PublishedElection | InvalidElection)[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [loaded, setLoaded] = useState<boolean>(false)
  const [error, setError] = useState<string>()
  const [finished, setFinished] = useState<boolean>(false)
  // we need refobserver to be in state to ensure the observer is assigned when rendering the ref layer
  // otherwise, the observer is not assigned and the intersection is not triggered
  const [refObserver, setRefObserver] = useState<HTMLDivElement | null>(null)

  const [page, setPage] = useState<number>(-1)
  useObserver(refObserver, setPage, setRefObserver)

  // refetch account info in case it changes in client (i.e. when editing the account profile in this same page)
  useEffect(() => {
    // only re-fetch if account is the same as the one rendered, otherwise it will load incorrect data
    if (!areEqualHexStrings(account?.address, organization?.address)) return

    fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  // resets fields on account change
  useEffect(() => {
    setElectionsList([])
    setFinished(false)
    setPage(0)
    setLoaded(false)
    setLoading(false)
  }, [organization?.address])

  // loads elections. Note the load trigger is done via useObserver using a layer visibility.
  useEffect(() => {
    if (finished || loading || !client || page === -1 || error || !organization?.address) return

    setLoading(true)

    client
      .fetchElections({ organizationId: organization.address, page })
      .then((res) => {
        const elections = res.elections
        if (!res || (res && (!elections.length || res.pagination.currentPage === res.pagination.lastPage))) {
          setFinished(true)
        }

        setElectionsList((prev: (PublishedElection | InvalidElection)[]) => {
          if (prev) return [...prev, ...elections]
          return elections
        })
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
        {electionsList?.map((election: any, idx: number) => (
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
    if (!refObserver) return

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
