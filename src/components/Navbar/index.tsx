import { Flex } from '@chakra-ui/react'
import { ColorModeSwitcher } from '~components/Layout/ColorModeSwitcher'
import Logo from '~components/Layout/Logo'
import { LanguagesMenu } from './LanguagesList'

const Navbar = () => (
  <Flex width='full' py={3} position='relative' justifyContent='space-between' zIndex='topbar' alignItems='center'>
    <Logo />
    <Flex alignItems='center' gap={2} justifySelf='end'>
      <LanguagesMenu />
      <ColorModeSwitcher />
    </Flex>
  </Flex>
)

export default Navbar
