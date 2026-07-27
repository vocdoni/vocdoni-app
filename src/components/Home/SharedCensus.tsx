import { AspectRatio, Box, Flex, Link, Spinner, Text } from '@chakra-ui/react'
import {
  ElectionProvider,
  ElectionStatusBadge,
  ElectionTitle,
  OrganizationImage,
  OrganizationProvider,
  useElection,
} from '@vocdoni/react-components'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import ReactPlayer from 'react-player'
import { Link as ReactRouterLink } from 'react-router-dom'
import Editor from '~components/Editor'
import { useAuth } from '~components/Auth/useAuth'
import { ManageProcessLink } from '~components/Process/ManageProcessLink'
import { CensusConnectButton } from '~components/Process/Aside'
import LogoutButton from '~components/Process/LogoutButton'
import { useAppEnv, useLanguagesEnv } from '~src/app-env'
import { ensureAddressPrefix, sameAddress } from '~utils/address'

export const parseProcessIds = (value: string | undefined) =>
  (value || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

const SharedCensus = () => {
  const { PROCESS_IDS } = useAppEnv()
  const processIds = parseProcessIds(PROCESS_IDS)

  if (processIds.length === 0) {
    return null
  }

  // The first process anchors the page: its census drives the identify flow
  // (the ElectionProvider hosts that CSP session) and its organization brands
  // the header.
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
  // Process reads return orgAddress unprefixed; the organization API expects 0x.
  const organizationAddress = election?.orgAddress ? ensureAddressPrefix(election.orgAddress) : undefined

  if (!organizationAddress) {
    return <>{children}</>
  }

  return <OrganizationProvider id={organizationAddress}>{children}</OrganizationProvider>
}

const SharedCensusHomeContent = () => {
  const { t, i18n } = useTranslation()
  const { loading, election, connected } = useElection()
  const { currentAddress, isAuthenticated } = useAuth()

  const isAdmin = isAuthenticated && sameAddress(currentAddress, election?.orgAddress)
  const canViewProcesses = connected || isAdmin
  const appEnv = useAppEnv()
  const processIds = parseProcessIds(appEnv.PROCESS_IDS)
  const languagesSlice = useLanguagesEnv()
  const defaultLanguage = Object.keys(languagesSlice)[0] || 'en'

  const getLocalizedMarkdown = (content?: Record<string, string>) => {
    if (!content) {
      return ''
    }

    const resolvedLanguage = i18n.resolvedLanguage || i18n.language
    const baseLanguage = resolvedLanguage.split('-')[0]

    return content[resolvedLanguage] ?? content[baseLanguage] ?? content[defaultLanguage] ?? ''
  }

  const parseSharedCensusCopy = (value?: Record<string, string> | string) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as Record<string, string>
      } catch {
        return undefined
      }
    }
    return value
  }

  const sharedCensusAlways = parseSharedCensusCopy(appEnv.SHARED_CENSUS_ALWAYS_VISIBLE_TEXT)
  const sharedCensusDisconnected = parseSharedCensusCopy(appEnv.SHARED_CENSUS_DISCONNECTED_TEXT)
  const sharedCensusConnected = parseSharedCensusCopy(appEnv.SHARED_CENSUS_CONNECTED_TEXT)
  const postText = parseSharedCensusCopy(appEnv.SHARED_CENSUS_POST_TEXT)
  const alwaysMarkdown = getLocalizedMarkdown(sharedCensusAlways)
  const disconnectedMarkdown = getLocalizedMarkdown(sharedCensusDisconnected)
  const connectedMarkdown = getLocalizedMarkdown(sharedCensusConnected)
  const streamUrl = typeof appEnv.STREAM_URL === 'string' ? appEnv.STREAM_URL : undefined
  const showStream = canViewProcesses && !!streamUrl
  const showAlways = !!alwaysMarkdown
  const showDisconnected = !!disconnectedMarkdown && !canViewProcesses
  const showConnected = !!connectedMarkdown && canViewProcesses
  const showTopContent = showAlways || showDisconnected || showConnected || showStream
  const pretextContent = [
    alwaysMarkdown,
    showDisconnected ? disconnectedMarkdown : '',
    showConnected ? connectedMarkdown : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  if (loading && !election) {
    return <Spinner />
  }

  if (!election) {
    return null
  }

  return (
    <Flex flexDirection='column' gap={10} maxW='max-content-width' mx='auto' px={5} alignItems='center'>
      <OrganizationImage h='100px' />
      {showTopContent && (
        <Box w='90%' display='flex' flexDirection='column' gap={4}>
          {(showAlways || showDisconnected || showConnected) && (
            <Box className='shared-census' data-testid='shared-census-pretext'>
              <Editor key={pretextContent} isDisabled defaultValue={pretextContent} />
            </Box>
          )}
          {showStream && (
            <Box data-testid='shared-census-stream' maxW='600px' alignSelf='center' w='100%'>
              <AspectRatio ratio={16 / 9}>
                <ReactPlayer src={streamUrl} width='100%' height='100%' controls={true} />
              </AspectRatio>
            </Box>
          )}
        </Box>
      )}
      <Box>{election && !isAdmin && <CensusConnectButton />}</Box>
      {canViewProcesses && (
        <Box w='90%'>
          <Text alignSelf='start' mb={10} as='h3' fontWeight='bold' fontSize='2xl' mt='-30px'>
            {t('shared_census.section_title', { defaultValue: 'Elections' })}
          </Text>
          <Flex gap={5} flexDirection={{ base: 'column' }}>
            {processIds.map((processId, index) => (
              <ElectionProvider id={processId} key={processId} queryOptions={{ refetchInterval: 15_000 }}>
                <ElectionItemList isAdmin={isAdmin} index={index} />
              </ElectionProvider>
            ))}
          </Flex>
        </Box>
      )}
      <LogoutButton />
      {canViewProcesses && (
        <Text mt='50px' maxW='800px' textAlign='center'>
          {t('shared_census.instructions.vote', {
            defaultValue:
              'Select the election to open a new window with the voting instructions. Once your vote is submitted, close the window to return here.',
          })}
        </Text>
      )}
      {!canViewProcesses && (
        <Text textAlign='center'>
          {t('shared_census.instructions.login', {
            defaultValue: 'To access the election press "Identify".',
          })}
          <br />
          {t('shared_census.instructions.identification', {
            defaultValue: 'We will ask for your identification. Afterwards, you can cast your vote securely.',
          })}
        </Text>
      )}
      {postText && (
        <Text display='flex' flexDirection='column' gap={4} maxW='90%' mt={10}>
          {getLocalizedMarkdown(postText)}
        </Text>
      )}
    </Flex>
  )
}

const ElectionItemList = ({ isAdmin, index }: { isAdmin: boolean; index: number }) => {
  // hasVoted resolves through this process's own CSP session; each process keeps
  // its own in-memory session, so it stays false here until the voter identifies
  // against this process (the voting window runs its own identify flow).
  const { election, hasVoted } = useElection()
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
          <Box fontSize='lg' display='flex' alignItems='center' p={4}>
            <Box as='span' mr={2} position='absolute' left={2} top={2} color='fg.subtle'>
              {index + 1}
            </Box>
            <ElectionTitle fontSize='lg' mb={0} />
            <ElectionStatusBadge position='absolute' top={1} right={1} />
            {hasVoted && (
              <Text fontSize='sm' color='green.400' position='absolute' bottom={0} right={1}>
                {t('shared_census.voted', { defaultValue: 'You already voted' })}
              </Text>
            )}
          </Box>
        </ReactRouterLink>
      </Link>
      <ManageProcessLink />
    </Flex>
  )
}

export default SharedCensus
