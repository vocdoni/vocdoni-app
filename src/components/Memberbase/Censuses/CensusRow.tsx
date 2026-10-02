import { Badge, Box, Flex, Grid, Icon, Link, Text } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LuChevronRight } from 'react-icons/lu'
import { Link as RouterLink } from 'react-router'
import { StateBadge } from '~components/Process/Dashboard/View/shared'
import type { VoteState } from './model'

/** A vote's state as a badge, drafts included. */
export const VoteStateBadge = ({ state }: { state?: VoteState }) => {
  const { t } = useTranslation()
  if (state === 'draft')
    return (
      <Badge colorPalette='gray' variant='outline' size='md' flexShrink={0}>
        {t('censuses.state.draft', { defaultValue: 'Draft' })}
      </Badge>
    )
  return <StateBadge state={state} />
}

type CensusRowProps = {
  title: string
  to: string
  badge?: ReactNode
  /** The one line under the title, its parts separated by dots */
  meta: ReactNode[]
  count: number
  /** What the count counts: "voters" or "people" */
  unit: string
  pinned?: boolean
}

/**
 * One census in the index: bordered like a vote in the Votes list, the count always on the right
 * (on phones too).
 */
export const CensusRow = ({ title, to, badge, meta, count, unit, pinned }: CensusRowProps) => {
  const { i18n } = useTranslation()

  return (
    <Grid
      as='li'
      templateColumns='minmax(0, 1fr) auto'
      gap={{ base: 3, md: 4 }}
      alignItems='center'
      px={4}
      py={3}
      borderRadius='md'
      border='1px solid'
      borderColor='border'
      bg={pinned ? 'bg.subtle' : 'bg'}
      position='relative'
      _hover={{ borderColor: 'border.emphasized' }}
    >
      <Box minW={0}>
        <Flex align='center' gap={2} minW={0} wrap='wrap'>
          <Link
            asChild
            fontSize='sm'
            fontWeight='bolder'
            textDecoration='none'
            _hover={{ textDecoration: 'underline' }}
            truncate
            minW={0}
            // The whole row is the link's hit area
            _after={{ content: '""', position: 'absolute', inset: 0 }}
          >
            <RouterLink to={to}>{title}</RouterLink>
          </Link>
          {badge}
        </Flex>
        <Flex gap={1.5} wrap='wrap' fontSize='xs' color='fg.muted' mt={0.5}>
          {meta.filter(Boolean).map((part, index) => (
            <Flex key={index} gap={1.5} align='center' minW={0}>
              {index > 0 && (
                <Text as='span' fontSize='xs' aria-hidden>
                  ·
                </Text>
              )}
              <Text as='span' fontSize='xs'>
                {part}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Box>
      <Flex align='center' gap={2}>
        <Box textAlign='right'>
          <Text fontSize='md' fontWeight='bolder' fontVariantNumeric='tabular-nums' lineHeight='short'>
            {count.toLocaleString(i18n.resolvedLanguage)}
          </Text>
          <Text fontSize='xs' color='fg.muted'>
            {unit}
          </Text>
        </Box>
        <Icon as={LuChevronRight} color='fg.muted' boxSize={4} aria-hidden hideBelow='md' />
      </Flex>
    </Grid>
  )
}
