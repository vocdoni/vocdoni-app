import { Box, Button } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-components'
import { CensusType, InvalidElection } from '@vocdoni/sdk'
import { useTranslation } from 'react-i18next'
import { useAuth } from '~components/Auth/useAuth'

// Note the LogoutButton is stored in the Process folder because it holds not just
// the app logout, but all the process sessions logout

const LogoutButton = () => {
  const { t } = useTranslation()
  const { election, connected, clearClient } = useElection()
  const { logout } = useAuth()

  if (election instanceof InvalidElection) return null

  const isCSP = election.census.type === CensusType.CSP

  if (!connected) return null

  return (
    <>
      <Box alignSelf='center' mb={{ base: 10, md: 0 }}>
        <Button
          onClick={() => {
            if (isCSP) {
              clearClient()
              return
            }

            // If session is app-signer based, close app auth.
            logout()
          }}
        >
          {t('logout')}
        </Button>
      </Box>
    </>
  )
}

export default LogoutButton
