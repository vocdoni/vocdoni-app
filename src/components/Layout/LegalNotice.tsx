import { Box, Link, Text } from '@chakra-ui/react'
import { useOrganization } from '@vocdoni/react-components'
import { Trans } from 'react-i18next'

const LegalNoticeContent = ({ orgName }: { orgName?: string }) => {
  if (!orgName) return null

  return (
    <Box
      data-testid='layout-legal-notice'
      mt={{ base: 10, xl: 12 }}
      maxW='6xl'
      mx='auto'
      color='texts.subtle'
      fontSize='sm'
      lineHeight={2}
      textAlign='center'
    >
      <Text as='p'>
        <Trans
          i18nKey='layout.legal_notice'
          defaults='To ensure a secure, verifiable and transparent vote, <strong>{{orgName}}</strong> uses the Vocdoni platform, which protects participants’ privacy at all times. More information at'
          values={{ orgName }}
          components={{
            strong: <Box as='strong' color='fg' fontWeight='semibold' />,
          }}
        />{' '}
        <Link href='https://vocdoni.io/' target='_blank' rel='noopener noreferrer' textDecor='underline'>
          vocdoni.io
        </Link>
        .
      </Text>
    </Box>
  )
}

const ProviderLegalNotice = () => {
  const { organization } = useOrganization()

  return <LegalNoticeContent orgName={organization?.name?.default || organization?.address} />
}

type LegalNoticeProps = {
  /** Renders without an OrganizationProvider (archive-era pages); falsy values render nothing. */
  orgName?: string
}

const LegalNotice = ({ orgName }: LegalNoticeProps) => {
  if (orgName !== undefined) return <LegalNoticeContent orgName={orgName} />

  return <ProviderLegalNotice />
}

export default LegalNotice
