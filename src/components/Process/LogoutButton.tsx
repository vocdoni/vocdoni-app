import { Box, Button } from '@chakra-ui/react'
import { useClient, useElection } from '@vocdoni/react-providers'
import { CensusType, dotobject, InvalidElection } from '@vocdoni/sdk'
import { useTranslation } from 'react-i18next'
import { useAccount, useDisconnect } from 'wagmi'
import { useAuth } from '~components/Auth/useAuth'
import { CensusMeta, CensusTypes } from '~components/Process/Census/CensusType'
import { SpreadsheetAccess } from '~components/vocdoni-ui'

// Note the LogoutButton is stored in the Process folder because it holds not just
// the app logout, but all the process sessions logout

const LogoutButton = () => {
  const { t } = useTranslation()
  const { disconnect } = useDisconnect()
  const { election, connected, clearClient } = useElection()
  const { isConnected } = useAccount()
  const { logout } = useAuth()
  const { clear } = useClient()

  if (election instanceof InvalidElection) return null

  const census: CensusMeta = dotobject(election?.meta || {}, 'census')

  const isCSP = election.census.type === CensusType.CSP
  const isSpreadsheet = census?.type === CensusTypes.Spreadsheet
  const isWeb3 = census?.type === CensusTypes.Web3

  if (!connected && !isConnected) return null

  return (
    <>
      <Box alignSelf='center' mb={{ base: 10, md: 0 }}>
        {connected && isSpreadsheet && <SpreadsheetAccess />}
        {connected && isCSP && (
          <Button
            onClick={() => {
              clearClient()
            }}
          >
            {t('logout')}
          </Button>
        )}
        {isWeb3 && (
          <Button
            onClick={() => {
              if (isConnected) {
                disconnect()
                clear()
              } else {
                // If not connected with web3 wallet, but connected we logout from APP
                logout()
              }
            }}
          >
            {t('logout')}
          </Button>
        )}
      </Box>
    </>
  )
}

export default LogoutButton
