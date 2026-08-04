import { AspectRatio, Box, Flex, IconButton } from '@chakra-ui/react'
import {
  OrganizationImage as Avatar,
  OrganizationDescription,
  OrganizationName,
  useOrganization,
} from '@vocdoni/react-components'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useReadMoreMarkdown } from '~components/Layout/use-read-more'
import AddressBtn from './Address'
import fallback from '/assets/default-avatar.png'

const OrganizationHeader = () => {
  const { t } = useTranslation()
  const { organization } = useOrganization()

  const { ReadMoreMarkdownWrapper, ReadMoreMarkdownButton } = useReadMoreMarkdown(600, 20)

  const { containerRef, isTruncated, readMore, handleReadMore } = useReadMoreTitle()

  return (
    <Flex
      flexDirection={{ base: 'column', lg: 'row' }}
      alignItems={{ base: 'center', lg: 'start' }}
      gap={{ base: 2, lg: 8 }}
      mb={10}
      pt={10}
    >
      <Box flex='1 1 10%' minW={40}>
        <AspectRatio ratio={1.25 / 1} maxW={56}>
          <Avatar
            mx='auto'
            fallbackSrc={fallback}
            alt={t('organization.avatar_alt', {
              name: organization?.name?.default || organization?.address,
            }).toString()}
          />
        </AspectRatio>
      </Box>

      <Flex
        flex='1 1 80%'
        justifyContent='space-between'
        alignItems={{ base: 'center', lg: 'start' }}
        flexDirection={{ base: 'column', lg: 'row' }}
        gap={{ base: 2 }}
        minW={0}
        maxW='100%'
      >
        <Flex
          flex='1 1 100%'
          direction='column'
          justifyContent={{ lg: 'space-between' }}
          alignItems={{ base: 'center', lg: 'start' }}
          gap={2}
          order={{ base: 2, lg: 0 }}
        >
          <Flex
            w='100%'
            ref={containerRef}
            flexDirection='row'
            justifyContent='space-between'
            alignItems='center'
            css={{
              h1: {
                noOfLines: readMore ? 1 : 'none',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 'var(--chakra-line-clamp)',
              },
            }}
          >
            <OrganizationName
              as='h1'
              fontSize={32}
              lineHeight={1.5}
              title={organization?.name?.default || organization?.address}
              maxW={{ base: '250px', sm: '300px', md: '450px', lg: '500px', xl: '650px' }}
            />
            <Box>
              {isTruncated && (
                <IconButton
                  alignSelf='start'
                  title={t('organization.title.read_more')}
                  aria-label={t('organization.title.read_more')}
                  onClick={handleReadMore}
                >
                  {readMore ? <FaEye /> : <FaEyeSlash />}
                </IconButton>
              )}
            </Box>
          </Flex>
          <ReadMoreMarkdownWrapper>
            <OrganizationDescription fontSize='lg' lineHeight={1.7} />
          </ReadMoreMarkdownWrapper>
          <ReadMoreMarkdownButton alignSelf='center' />
        </Flex>
        <AddressBtn />
      </Flex>
    </Flex>
  )
}

const useReadMoreTitle = () => {
  const [readMore, setReadMore] = useState(false)
  const [isTruncated, setIsTruncated] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleReadMore = () => setReadMore((prev) => !prev)

  useEffect(() => {
    if (!containerRef.current) return
    const containerHeight = containerRef.current.getBoundingClientRect().height
    const text = containerRef.current.querySelector('h1, p')

    if (!text) return
    const fontSizeTitle = Number(getComputedStyle(text).fontSize.split('px')[0])

    if (containerHeight > fontSizeTitle * 2) {
      setReadMore(true)
      setIsTruncated(true)
    }
  }, [])

  return {
    containerRef,
    readMore,
    isTruncated,
    handleReadMore,
  }
}

export default OrganizationHeader
