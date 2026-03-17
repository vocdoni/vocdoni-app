import { Box, Button, Card, Flex, Image, Text } from '@chakra-ui/react'
import { useClient, useOrganization } from '@vocdoni/react-components'
import { areEqualHexStrings } from '@vocdoni/sdk'
import { useTranslation } from 'react-i18next'
import { RouterAwareLink } from '~components/RouterAwareLink'
import { Routes } from '~src/router/routes'
import { generatePath } from 'react-router-dom'
import empty from '/assets/illustrations/2.png'

const NoElections = () => {
  const { t } = useTranslation()
  const { account } = useClient()
  const { organization } = useOrganization()

  return (
    <Card.Root variant='no-elections' minH='100%'>
      <Card.Body>
        <Flex justifyContent={'center'}>
          <Image src={empty} alt={t('organization.elections_list_empty.alt')} _dark={{ filter: 'invert(70%)' }} />
        </Flex>
        <Box>
          {areEqualHexStrings(account?.address, organization?.address) ? (
            <>
              <Text fontWeight='600' fontSize='lg' m='20px 0px'>
                {t('organization.elections_list_empty.title')}
              </Text>
              <Text>{t('organization.elections_list_empty.description')}</Text>

              <Button mt='40px' w='100%' asChild>
                <RouterAwareLink to={generatePath(Routes.processes.create)}>{t('menu.create')}</RouterAwareLink>
              </Button>
            </>
          ) : (
            <Text textAlign='center'>{t('organization.elections_list_empty.not_owner')}</Text>
          )}
        </Box>
      </Card.Body>
    </Card.Root>
  )
}

export default NoElections
