import { Box, Flex, HStack, Icon, Link } from '@chakra-ui/react'
import { Trans, useTranslation } from 'react-i18next'
import { LuCircleCheck } from 'react-icons/lu'
import type { CertHolder } from '~src/queries/certificateAuth/types'
import { P, Small } from './kit'

type Props = {
  holder: CertHolder
  onLogout(): void
}

/**
 * Slim success strip shown above the ballot once the voter has been identified.
 * One variant for every census type (anonymous or named).
 */
export const IdentifiedStrip = ({ holder, onLogout }: Props) => {
  const { t } = useTranslation()

  return (
    <Box
      border='1px solid'
      borderColor='border.success'
      bg='bg.success'
      borderRadius='md'
      px={4}
      py={3}
      role='status'
      className='ph-no-capture'
    >
      <Flex gap={3} align='start' justify='space-between' wrap='wrap'>
        <HStack align='start' gap={2} flex='1 1 18rem' minW={0}>
          <Icon as={LuCircleCheck} color='fg.success' boxSize={5} mt='2px' flexShrink={0} />
          <P>
            <Trans
              i18nKey='cert_auth.identified.line'
              defaults="You're identified as <b>{{name}}</b> ({{docType}} ending in {{ending}})."
              values={{ name: holder.fullName, docType: holder.documentType, ending: holder.documentEnding }}
              components={{ b: <b /> }}
            />{' '}
            <Link asChild whiteSpace='nowrap'>
              <button type='button' onClick={onLogout}>
                {t('cert_auth.identified.logout', { defaultValue: 'Not you? Log out' })}
              </button>
            </Link>
          </P>
        </HStack>
      </Flex>
      <Small color='fg.muted' mt={1} ps={7}>
        {t('cert_auth.identified.privacy', {
          defaultValue:
            "Your certificate was only used to check you're on the voter list; it's not attached to your ballot.",
        })}
      </Small>
    </Box>
  )
}
