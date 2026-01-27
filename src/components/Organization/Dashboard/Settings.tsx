import { AvatarFallback, AvatarImage, AvatarRoot, Flex } from '@chakra-ui/react'
import { useClient } from '@vocdoni/react-providers'
import { FaRegBell } from 'react-icons/fa6'
import { LuInfo } from 'react-icons/lu'
import { RiSettings5Line } from 'react-icons/ri'

const Settings = () => {
  const { account } = useClient()

  return (
    <Flex justifyContent='center' alignItems='center' gap={1.5}>
      <FaRegBell />
      <LuInfo />
      <RiSettings5Line />
      <AvatarRoot size='sm'>
        {account?.account.avatar ? <AvatarImage src={account.account.avatar} /> : null}
        <AvatarFallback name={account?.account.name.default || account?.address} />
      </AvatarRoot>
    </Flex>
  )
}

export default Settings
