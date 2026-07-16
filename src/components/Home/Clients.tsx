import { Box, BoxProps, Card, Grid, GridProps, Image, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import barca from '/assets/barca.png'
import bellpuig from '/assets/bellpuig.svg.png'
import berga from '/assets/berga.svg.png'
import bisbal from '/assets/bisbal.svg'
import bloock from '/assets/bloock.png'
import coec from '/assets/coec.png'
import decidim from '/assets/decidim.png'
import erc from '/assets/erc.svg'
import omnium from '/assets/omnium.png'
import ticanoia from '/assets/ticanoia.png'

const Clients = (props: BoxProps) => {
  const { t } = useTranslation()

  return (
    <Box {...props}>
      <Text textAlign='center' mb={10} fontSize={'lg'} fontWeight='400'>
        {t('home.clients_title')}
      </Text>
      <ClientsGrid />
    </Box>
  )
}

export const ClientsGrid = (props: GridProps) => {
  const { t } = useTranslation()

  return (
    <Grid
      as='section'
      maxWidth='1400px'
      mx='auto'
      mb={{ base: '40px', lg: '80px' }}
      px={{
        base: 2,
        sm: 4,
        lg: 6,
      }}
      gridTemplateColumns={{ base: 'repeat(5, 1fr)', md: 'repeat(10, 1fr)' }}
      justifyContent='end'
      w='full'
      {...props}
    >
      <Card.Root variant='client'>
        <Card.Header>
          <Image src={barca} h={'40px'} alt={t('alt.images.barca')} />
        </Card.Header>
        <Card.Body>
          <Text as='span'>F.C. Barcelona</Text>
        </Card.Body>
      </Card.Root>
      <Card.Root variant='client'>
        <Card.Header>
          <Image src={omnium} h={'57px'} alt={t('alt.images.omnium')} />
        </Card.Header>
        <Card.Body>
          <Text as='span'>Omnium Cultural</Text>
        </Card.Body>
      </Card.Root>
      <Card.Root variant='client'>
        <Card.Header>
          <Image src={berga} h={'41px'} alt={t('alt.images.berga')} />
        </Card.Header>
        <Card.Body>
          <Text as='span'>Ajuntament Berga</Text>
        </Card.Body>
      </Card.Root>
      <Card.Root variant='client'>
        <Card.Header>
          <Image src={bisbal} h={'33px'} alt={t('alt.images.bisbal')} />
        </Card.Header>
        <Card.Body>
          <Text as='span'>Ajuntament la Bisbal</Text>
        </Card.Body>
      </Card.Root>
      <Card.Root variant='client'>
        <Card.Header>
          <Image src={coec} h={'20px'} alt={t('alt.images.coec')} />
        </Card.Header>
        <Card.Body>
          <Text as='span'>COEC</Text>
        </Card.Body>
      </Card.Root>
      <Card.Root variant='client'>
        <Card.Header>
          <Image src={erc} h={'32px'} alt={t('alt.images.esquerra')} />
        </Card.Header>
        <Card.Body>
          <Text as='span'>Esquerra Republicana</Text>
        </Card.Body>
      </Card.Root>
      <Card.Root variant='client'>
        <Card.Header>
          <Image src={bellpuig} h={'33px'} alt={t('alt.images.bellpuig')} />
        </Card.Header>
        <Card.Body>
          <Text as='span'>Ajuntament Bellpuig</Text>
        </Card.Body>
      </Card.Root>
      <Card.Root variant='client'>
        <Card.Header>
          <Image src={ticanoia} h={'18px'} alt={t('alt.images.ticanoia')} />
        </Card.Header>
        <Card.Body>
          <Text as='span'>TIC Anoia</Text>
        </Card.Body>
      </Card.Root>
      <Card.Root variant='client'>
        <Card.Header>
          <Image src={decidim} h={'30px'} alt={t('alt.images.decidim')} />
        </Card.Header>
        <Card.Body>
          <Text as='span'>Decidim</Text>
        </Card.Body>
      </Card.Root>
      <Card.Root variant='client'>
        <Card.Header>
          <Image src={bloock} h={'17px'} alt={t('alt.images.bloock')} />
        </Card.Header>
        <Card.Body>
          <Text as='span'>Bloock</Text>
        </Card.Body>
      </Card.Root>
    </Grid>
  )
}

export default Clients
