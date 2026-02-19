import { Box, Card, Flex, Image, Text } from '@chakra-ui/react'
import { Trans } from 'react-i18next'
import empty from '/assets/illustrations/2.png'

export const NoResultsFiltering = () => (
  <Card.Root variant='no-elections' minH='100%' maxW='650' m='80px auto'>
    <Card.Body>
      <Flex justifyContent={'center'}>
        <Image src={empty} _dark={{ filter: 'invert(70%)' }} />
      </Flex>
      <Box mt='50px' textAlign='center'>
        <Text as='h3' fontSize='md' fontWeight='bold'>
          <Trans i18nKey='no_results_filtering'>Your current search filter returns no results</Trans>
        </Text>
      </Box>
    </Card.Body>
  </Card.Root>
)
