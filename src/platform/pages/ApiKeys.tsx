import { Stack, Text } from '@chakra-ui/react'
import ApiKeysPanel from '~platform/components/ApiKeys/ApiKeysPanel'

const ApiKeysPage = () => (
  <Stack gap={5}>
    <Stack gap={1}>
      <Text fontSize='2xl' fontWeight='bold'>
        API Keys
      </Text>
      <Text color='fg.muted' fontSize='sm'>
        Programmatic credentials for calling the Vocdoni API as this organization.
      </Text>
    </Stack>
    <ApiKeysPanel />
  </Stack>
)

export default ApiKeysPage
