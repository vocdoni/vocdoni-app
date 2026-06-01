import { AspectRatio, Box, Flex, Heading, Image, Link, List, Spinner, Text } from '@chakra-ui/react'
import {
  ElectionProvider,
  ElectionStatusBadge,
  ElectionTitle,
  OrganizationProvider,
  useClient,
  useElection,
} from '@vocdoni/react-components'
import { InvalidElection, PublishedElection } from '@vocdoni/sdk'
import { ReactNode, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ReactPlayer from 'react-player'
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom'
import { ActionsMenu } from '~components/Process/ActionsMenu'
import { CensusConnectButton } from '~components/Process/Aside'
import LogoutButton from '~components/Process/LogoutButton'
import { parseProcessIds } from '~utils/strings'
import cgt from '/assets/cgt.png'
import intersindical from '/assets/laintersindical.png'
import ustec from '/assets/ustec.png'

// Re-exported for backwards compatibility with existing importers (e.g. the home route).
export { parseProcessIds }

const processIds = parseProcessIds(import.meta.env.PROCESS_IDS)

const autoRedirect =
  import.meta.env.SHARED_CENSUS_AUTOREDIRECT === true || import.meta.env.SHARED_CENSUS_AUTOREDIRECT === 'true'

const SharedCensus = () => {
  if (processIds.length === 0) {
    return null
  }

  return (
    <ElectionProvider id={processIds[0]}>
      <SharedCensusOrganizationBoundary>
        <SharedCensusHomeContent />
      </SharedCensusOrganizationBoundary>
    </ElectionProvider>
  )
}

const SharedCensusOrganizationBoundary = ({ children }: { children: ReactNode }) => {
  const { election } = useElection()
  const organizationId = (election as PublishedElection | undefined)?.organizationId

  if (!organizationId) {
    return <>{children}</>
  }

  return <OrganizationProvider id={organizationId}>{children}</OrganizationProvider>
}

const SharedCensusHomeContent = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { loading, loaded, election, connected } = useElection()
  const { account, connected: aconnected } = useClient()

  const isAdmin = aconnected && account?.address === (election as PublishedElection)?.organizationId
  const canViewProcesses = connected || isAdmin

  useEffect(() => {
    if (!autoRedirect || !connected || isAdmin || !processIds[0]) {
      return
    }

    navigate(`/processes/${processIds[0]}/${window.location.hash}`)
  }, [connected, isAdmin, navigate])
  const streamUrl = typeof import.meta.env.STREAM_URL === 'string' ? import.meta.env.STREAM_URL : undefined
  const showStream = canViewProcesses && !!streamUrl

  if (!election || election instanceof InvalidElection) {
    return null
  }

  if (loading && !loaded) {
    return <Spinner />
  }

  return (
    <Flex flexDirection='column' gap={4} maxW='max-content-width' mx='auto' px={5} alignItems='center'>
      <Heading size='4xl' fontWeight='bold' mb={6}>
        Consulta sobre el preacord del 29 de maig
      </Heading>
      <Box w='90%' display='flex' flexDirection='column' gap={4}>
        <SharedCensusPretext />
        {showStream && (
          <Box data-testid='shared-census-stream' maxW='600px' alignSelf='center' w='100%'>
            <AspectRatio ratio={16 / 9}>
              <ReactPlayer src={streamUrl} width='100%' height='100%' controls={true} />
            </AspectRatio>
          </Box>
        )}
      </Box>
      <Box w='250px'>{election && !isAdmin && <CensusConnectButton />}</Box>
      {canViewProcesses && (
        <Box w='90%'>
          <Text alignSelf='start' mb={10} as='h3' fontWeight='bold' fontSize='22px' style={{ marginTop: '-30px' }}>
            {t('shared_census.section_title', { defaultValue: 'Elections' })}
          </Text>
          <Flex gap={5} flexDirection={{ base: 'column' }}>
            {processIds.map((processId, index) => (
              <ElectionProvider id={processId} key={processId} queryOptions={{ refetchInterval: 15_000 }} fetchCensus>
                <ElectionItemList isAdmin={isAdmin} index={index} />
              </ElectionProvider>
            ))}
          </Flex>
        </Box>
      )}
      <LogoutButton />
      {canViewProcesses && (
        <Text style={{ marginTop: '50px', maxWidth: '800px', textAlign: 'center' }}>
          {t('shared_census.instructions.vote', {
            defaultValue:
              'Select the election to open a new window with the voting instructions. Once your vote is submitted, close the window to return here.',
          })}
        </Text>
      )}
      {!canViewProcesses && (
        <Text style={{ textAlign: 'center' }}>
          {t('shared_census.instructions.login', {
            defaultValue: 'To access the election press "Identify".',
          })}
        </Text>
      )}
      <SharedCensusPostText />
    </Flex>
  )
}

// Texts are hardcoded here (instead of relying on the SHARED_CENSUS_* env vars) because env vars are
// declared inconsistently across our deployment environments. They are styled to mimic rendered markdown.
const SharedCensusPretext = () => (
  <Box
    className='shared-census'
    data-testid='shared-census-pretext'
    display='flex'
    flexDirection='column'
    gap={4}
    mb={6}
  >
    <Text textStyle='sm'>
      Aquesta consulta té com a objectiu recollir la decisió del personal docent sobre el preacord assolit el 29 de maig
      de 2026 entre el Departament d'Educació i les organitzacions sindicals USTEC·STEs (IAC), ASPEPC·SPS, CCOO I UGT.
    </Text>
    <Text textStyle='sm'>
      Aquesta consulta la promovem conjuntament les organitzacions USTEC·STEs (IAC), CGT i La Intersindical.
    </Text>
    <Text textStyle='sm'>
      Podrà participar en la consulta el personal docent habilitat segons els criteris establerts per les organitzacions
      convocants, des d'avui, dilluns 1 de juny a les 12 h, fins dijous 4 de juny a les 12 h.
    </Text>
    <Text textStyle='sm'>
      Abans de votar, us animem a debatre el preacord als centres i assemblees. Cal decidir si és el moment de ratificar
      el preacord i consolidar aquests avenços, o si es considera insuficient i cal continuar pressionant, amb vagues
      fins a acabar el curs, per aconseguir una proposta millor.
    </Text>
    <List.Root ps={{ base: 0, md: '1rem' }} listStylePos={{ base: 'outside', md: 'inside' }}>
      <List.Item>
        <Link
          href='https://voting-images.lon1.cdn.digitaloceanspaces.com/2026-06/Preacord.pdf'
          target='_blank'
          rel='noopener noreferrer'
        >
          Preacord del 29 de maig
        </Link>
      </List.Item>
      <List.Item>
        <Link
          href='https://voting-images.lon1.cdn.digitaloceanspaces.com/2026-06/AcordDel9DeMar%C3%A7.pdf'
          target='_blank'
          rel='noopener noreferrer'
        >
          Acord del 9 de març
        </Link>
      </List.Item>
      <List.Item whiteSpace='pre'>
        <Link
          href='https://voting-images.lon1.cdn.digitaloceanspaces.com/2026-06/AcordsPresosEnLaComissi%C3%B3DeSeguimentiDesplegament.pdf'
          target='_blank'
          rel='noopener noreferrer'
          textWrap='balance'
        >
          Acta de la Comissió de Desplegament i Seguiment
        </Link>
      </List.Item>
    </List.Root>
    <Box>
      <Text textStyle='sm' fontWeight='extrabold'>
        Com funciona la votació?
      </Text>
      <List.Root
        as='ol'
        listStyleType='decimal'
        ps={{ base: 0, md: '2rem' }}
        mt='1rem'
        display='flex'
        flexDirection='column'
        gap='0.125rem'
        listStylePos={{ base: 'outside', md: 'inside' }}
      >
        <List.Item textStyle='sm'>Identifica't amb el teu correu corporatiu d'XTEC.</List.Item>
        <List.Item textStyle='sm'>
          Si formes part del cens habilitat, rebràs un codi d'autenticació al teu correu electrònic, si no, escriu a{' '}
          <Link href='mailto:consulta.unitaria@sindicat.net'>consulta.unitaria@sindicat.net</Link>.
        </List.Item>
        <List.Item textStyle='sm'>Introdueix el codi a la pantalla de validació per accedir a la votació.</List.Item>
        <List.Item textStyle='sm'>
          Selecciona l'opció desitjada i prem el botó «Votar». El sistema et demanarà una confirmació abans d'emetre el
          vot.
        </List.Item>
        <List.Item textStyle='sm'>Emet el teu vot de forma segura i verificable.</List.Item>
      </List.Root>
    </Box>
    <Text textStyle='sm'>
      El vot és secret i el sistema incorpora les mesures tècniques necessàries per garantir la integritat del procés de
      votació i assegurar que cada participant només pugui emetre un únic vot.
    </Text>
    <Text textStyle='sm' maxW='90%' data-testid='shared-census-posttext'>
      Si no reps el correu de la votació o tens qualsevol incidència tècnica, posa't en contacte amb{` `}
      <Link href='mailto:consulta.unitaria@sindicat.net'>consulta.unitaria@sindicat.net</Link> i indica el teu nom i
      cognoms, correu XTEC, centre de treball i especialitat. Moltes gràcies!
    </Text>
  </Box>
)

const SharedCensusPostText = () => (
  <>
    <Flex wrap='wrap' justify='center' align='center' gap={{ base: 6, md: 10 }} data-testid='shared-census-logos'>
      <Image src={ustec} alt='Logo USTEC' h={{ base: '50px', md: '70px' }} w='auto' />
      <Image src={cgt} alt='Logo CGT' h={{ base: '50px', md: '70px' }} w='auto' />
      <Image src={intersindical} alt='Logo La Intersindical' h={{ base: '50px', md: '70px' }} w='auto' />
    </Flex>
  </>
)

const ElectionItemList = ({ isAdmin, index }: { isAdmin: boolean; index: number }) => {
  const { election, voted } = useElection()
  const { t } = useTranslation()

  return (
    <Flex>
      <Link
        asChild
        flexGrow={1}
        display='flex'
        justifyContent='center'
        alignItems='center'
        flexWrap='wrap'
        h={{ base: '100px' }}
        borderRadius='md'
        color='texts.primary'
        textDecoration='none'
        textAlign='center'
        fontWeight='bold'
        boxShadow='lg'
        _dark={{
          boxShadow: '0 10px 15px -3px #343434,0 4px 6px -2px #444',
        }}
        _hover={{
          bgColor: 'gray.500',
        }}
        _active={{
          transform: 'scale(0.9)',
        }}
        position='relative'
      >
        <ReactRouterLink
          to={`/processes/${election?.id}/${window.location.hash}`}
          target={!isAdmin ? '_blank' : undefined}
          rel={!isAdmin ? 'noopener noreferrer' : undefined}
        >
          <Box fontSize='18px' display='flex' alignItems='center' p={4}>
            <Box as='span' mr={2} position='absolute' left={2} top={2} color='gray.400'>
              {index + 1}
            </Box>
            <ElectionTitle fontSize='18px' mb={0} />
            <ElectionStatusBadge position='absolute' top={1} right={1} />
            {voted && (
              <Text fontSize='14px' color='green.400' position='absolute' bottom={0} right={1}>
                {t('shared_census.voted', { defaultValue: 'You already voted' })}
              </Text>
            )}
          </Box>
        </ReactRouterLink>
      </Link>
      {isAdmin && <ActionsMenu />}
    </Flex>
  )
}

export default SharedCensus
