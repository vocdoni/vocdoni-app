import { Box, Card, Flex, Heading, Text } from '@chakra-ui/react'
import { ReactNode, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { AuthLayoutHeader } from '~components/Auth/AuthLayoutHeader'
import { AuthShowcase, AuthTrustBar, useAuthVertical, useVerticalSlug } from '~components/Auth/vertical'
import { withVerticalParam } from '~constants/verticals'
import { Routes } from '~routes'

export type AuthOutletContextType = {
  setTitle: React.Dispatch<React.SetStateAction<string>>
  setSubtitle: React.Dispatch<React.SetStateAction<string>>
}

type AuthLayoutProps = {
  /** The app's sign-in path: the header links home from it and back to sign in everywhere else. */
  signInPath: string
  /** Where "back" leads, when it carries more than the path (the vertical param). */
  signInRoute?: string
  /** A panel beside the form column; without one the card is a single, narrower column. */
  aside?: ReactNode
  /** A row below the card. */
  footer?: ReactNode
}

/**
 * Chrome of every auth screen, account and integrators alike: the header row, the card and the title
 * and subtitle the routed screen sets through the outlet context.
 */
export const AuthLayout = ({ signInPath, signInRoute = signInPath, aside, footer }: AuthLayoutProps) => {
  const [title, setTitle] = useState<string | null>(null)
  const [subtitle, setSubtitle] = useState<string | null>(null)
  const { pathname } = useLocation()

  const body = (
    <>
      {(title || subtitle) && (
        <Box mb={6}>
          {title && (
            <Heading size='lg' mb={1} letterSpacing='heading.tight'>
              {title}
            </Heading>
          )}
          {subtitle && (
            <Text color='fg.muted' fontSize='sm'>
              {subtitle}
            </Text>
          )}
        </Box>
      )}
      <Outlet context={{ setTitle, setSubtitle } satisfies AuthOutletContextType} />
    </>
  )

  return (
    <Flex justifyContent='center' minH='dvh' p={{ base: 6, md: 10 }}>
      <Flex w='full' maxW={aside ? { base: 'md', md: '4xl', lg: '6xl' } : 'md'} flexDir='column' gap={2} my='auto'>
        <AuthLayoutHeader isSignin={pathname === signInPath} signInRoute={signInRoute} />
        {aside ? (
          <Card.Root
            variant='standalone'
            flexDirection='row'
            w='full'
            // Floor, not a fixed height: the row still grows for a long form or a long quote. It only
            // stops the panel from collapsing to the height of whichever form sits next to it — the
            // verify and recovery screens are barely three fields tall.
            minH={{ md: '34rem', lg: '38rem' }}
            // No `overflow='hidden'` here: it would also clip the form column's dropdown menus — the
            // create-organization screen renders chakra-react-select menus without a portal, and a
            // clipped ancestor cuts them off at the card edge. The showcase panel rounds and clips
            // its own corners instead (see `AuthShowcase`).
          >
            <Flex
              p={{ base: 6, sm: 8, lg: 10 }}
              flex={{ base: '1 1 100%', md: '0 0 52%', lg: '0 0 46%' }}
              minW={0}
              flexDir='column'
              justifyContent='center'
            >
              {body}
            </Flex>
            {aside}
          </Card.Root>
        ) : (
          // A block, not the card's flex column: the routed pages below lay themselves out.
          <Card.Root variant='standalone' display='block' w='full' p={{ base: 6, sm: 8 }}>
            {body}
          </Card.Root>
        )}
        {footer}
      </Flex>
    </Flex>
  )
}

/**
 * The account auth screens (sign in, sign up, verify, recovery, password reset, create organization).
 *
 * What the vertical changes is the chrome, not the flows: only the showcase panel beside the form
 * column and the trust bar below it render differently per `?type=` (see `~components/Auth/vertical`).
 * The route elements in the outlet do read the slug — but solely to keep the param on their outbound
 * links; nothing they say or render varies with it, and the form components they wrap just receive
 * route strings.
 */
const LayoutAuth = () => {
  const vertical = useAuthVertical()
  const slug = useVerticalSlug()

  return (
    // The sign-in link carries the vertical like every other auth link; the home link is the
    // marketing site and takes no param.
    <AuthLayout
      signInPath={Routes.auth.signIn}
      signInRoute={withVerticalParam(Routes.auth.signIn, slug)}
      aside={<AuthShowcase vertical={vertical} />}
      footer={<AuthTrustBar vertical={vertical} />}
    />
  )
}

export default LayoutAuth
