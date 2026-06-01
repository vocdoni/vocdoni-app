import { Button, Icon } from '@chakra-ui/react'
import { FiExternalLink } from 'react-icons/fi'
import { generatePath, Link as ReactRouterLink } from 'react-router-dom'
import { parseProcessIds } from '~components/Home/SharedCensus'
import { Routes } from '~src/router/routes'

const followProcessId = parseProcessIds(import.meta.env.PROCESS_IDS)[0]

// Hardcoded "Seguiment" shortcut to the summary of the first configured process.
const FollowButton = () => {
  if (!followProcessId) return null

  return (
    <Button asChild size='sm' variant='outline'>
      <ReactRouterLink target='_blank' to={generatePath(Routes.processes.summary, { id: followProcessId })}>
        Seguiment <Icon as={FiExternalLink} />
      </ReactRouterLink>
    </Button>
  )
}

export default FollowButton
