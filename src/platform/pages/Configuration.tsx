import { Stack, Tabs, Text } from '@chakra-ui/react'
import { LuLifeBuoy, LuReceipt, LuUsers } from 'react-icons/lu'
import SubscriptionTab from '~platform/components/Configuration/SubscriptionTab'
import SupportTab from '~platform/components/Configuration/SupportTab'
import TeamTab from '~platform/components/Configuration/TeamTab'

const ConfigurationPage = () => (
  <Stack gap={5}>
    <Stack gap={1}>
      <Text fontSize='2xl' fontWeight='bold'>
        Configuration
      </Text>
      <Text color='fg.muted' fontSize='sm'>
        Manage your team, subscription and support.
      </Text>
    </Stack>

    <Tabs.Root defaultValue='team' variant='enclosed' lazyMount>
      <Tabs.List>
        <Tabs.Trigger value='team'>
          <LuUsers /> Team
        </Tabs.Trigger>
        <Tabs.Trigger value='subscription'>
          <LuReceipt /> Subscription
        </Tabs.Trigger>
        <Tabs.Trigger value='support'>
          <LuLifeBuoy /> Support
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value='team'>
        <TeamTab />
      </Tabs.Content>
      <Tabs.Content value='subscription'>
        <SubscriptionTab />
      </Tabs.Content>
      <Tabs.Content value='support'>
        <SupportTab />
      </Tabs.Content>
    </Tabs.Root>
  </Stack>
)

export default ConfigurationPage
