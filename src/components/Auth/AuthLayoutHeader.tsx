import { Flex, Icon, Link } from '@chakra-ui/react'
import { Trans } from 'react-i18next'
import { LuArrowLeft } from 'react-icons/lu'
import { Link as RouterLink } from 'react-router'
import { LanguagesMenu } from '~components/Navbar/LanguagesList'
import { Routes } from '~routes'

/**
 * Top row shared by the auth layouts: a link home from the sign-in screen (back to sign in
 * everywhere else) and the language selector.
 */
export const AuthLayoutHeader = ({ isSignin, signInRoute }: { isSignin: boolean; signInRoute: string }) => (
  <Flex alignItems='center' justifyContent='space-between' gap={2}>
    <Link asChild display='flex' alignItems='center'>
      <RouterLink to={isSignin ? Routes.vocdoni : signInRoute}>
        <Icon as={LuArrowLeft} />
        {isSignin ? <Trans i18nKey='common.home'>Home</Trans> : <Trans i18nKey='common.back'>Back</Trans>}
      </RouterLink>
    </Link>
    <LanguagesMenu />
  </Flex>
)
