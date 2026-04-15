import { Box, Link, Text } from '@chakra-ui/react'
import { OrganizationProvider, useOrganization } from '@vocdoni/react-components'
import { Trans } from 'react-i18next'
import { useRouteLoaderData } from 'react-router-dom'

const LegalNoticeContent = () => {
  const { organization } = useOrganization()
  const orgName = organization?.account?.name?.default || organization?.address

  if (!orgName) return null

  return (
    <Box
      data-testid='layout-legal-notice'
      mt={{ base: 10, xl: 12 }}
      maxW='6xl'
      mx='auto'
      color='texts.subtle'
      style={{ fontSize: '0.875rem', lineHeight: '1.75rem', textAlign: 'center' }}
    >
      <Text as='p'>
        <Trans
          i18nKey='layout.legal_notice'
          defaults='To ensure a secure, verifiable and transparent vote, <strong>{{orgName}}</strong> uses the Vocdoni platform, which protects participants’ privacy at all times. More information at'
          values={{ orgName }}
          components={{
            strong: <Box as='strong' color='texts.default' fontWeight='semibold' />,
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

const LegalNotice = () => {
  const processData = useRouteLoaderData('process-view') as { organizationId?: string } | undefined
  const organizationId = processData?.organizationId

  if (!organizationId) return null

  return (
    <OrganizationProvider id={organizationId}>
      <LegalNoticeContent />
    </OrganizationProvider>
  )
}

export default LegalNotice
