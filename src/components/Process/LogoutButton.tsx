import { Box, Button } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'

// Note the LogoutButton is stored in the Process folder because it closes the
// per-process voter session. In the v2 model every voter session is a CSP process
// session (there is no wallet-signer voting), so logging out is always clearVoter().

const LogoutButton = () => {
  const { t } = useTranslation()
  const { connected, clearVoter } = useElection()

  if (!connected) return null

  return (
    <Box alignSelf='center' mb={{ base: 10, md: 0 }}>
      <Button onClick={clearVoter}>{t('logout')}</Button>
    </Box>
  )
}

export default LogoutButton
