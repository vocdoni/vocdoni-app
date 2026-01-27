import { Box, Button, Card, Flex, Image, Text } from '@chakra-ui/react'
import { Trans } from 'react-i18next'
import { Link as ReactRouterLink } from 'react-router-dom'
import { DashboardContents } from '~shared/Dashboard/Contents'
import { Routes } from '~src/router/routes'
import empty from '/assets/illustrations/9.png'

export const NoOrganizations = () => {
  return (
    <Flex flexDirection={'column'}>
      <Button asChild alignSelf='end' colorPalette='gray' size='xs'>
        <ReactRouterLink to={Routes.plans}>
          <Trans i18nKey='view_plans_and_pricing'>View Plans & Pricing</Trans>
        </ReactRouterLink>
      </Button>
      <Card.Root variant='no-elections' minH='100%' maxW='650' mx='auto'>
        <Card.Body>
          <Flex justifyContent={'center'}>
            <Image src={empty} _dark={{ filter: 'invert(70%)' }} />
          </Flex>
          <Box>
            <Text fontWeight='600' fontSize='lg' m='20px 0px'>
              <Trans i18nKey='organization.no_organization_title'>You don't belong to any organization yet!</Trans>
            </Text>
            <Text mb='20px'>
              <Trans i18nKey='new_organization.description1' components={{ span: <Text as='span' fontWeight='600' /> }}>
                Set up your{' '}
                <Text as='span' fontWeight='bold'>
                  organization for free
                </Text>{' '}
                and start creating voting processes to engage with your community.
              </Trans>
            </Text>
            <Text mb='20px'>
              <Trans i18nKey='new_organization.onboarding'>
                If your organization is already on Vocdoni, ask its administrator to invite you.
              </Trans>
            </Text>
          </Box>
          <Button mt='40px' w='100%' asChild>
            <ReactRouterLink to={Routes.dashboard.organizationCreate}>
              <Trans i18nKey='create_org.create_button'>Create your organization</Trans>
            </ReactRouterLink>
          </Button>
        </Card.Body>
      </Card.Root>
    </Flex>
  )
}

export const NoOrganizationsPage = () => (
  <DashboardContents>
    <NoOrganizations />
  </DashboardContents>
)
