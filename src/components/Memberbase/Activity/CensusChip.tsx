import { Box, chakra, Icon, Popover, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LuBookmark, LuLayers, LuUsers } from 'react-icons/lu'
import type { CensusFilter, CensusRef } from './censusRefs'

const chipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 1.5,
  h: 6,
  px: 2.5,
  maxW: '220px',
  borderRadius: 'full',
  borderWidth: '1px',
  borderColor: 'border',
  bg: 'bg',
  fontSize: 'xs',
  color: 'fg',
  flexShrink: 0,
  cursor: 'pointer',
  _hover: { bg: 'bg.muted' },
  _focusVisible: { outline: '2px solid', outlineColor: 'colorPalette.focusRing', outlineOffset: '1px' },
} as const

/** A saved census gets a bookmark; a vote's census, its vote's status dot. */
export const CensusMark = ({ census }: { census: CensusRef }) =>
  census.kind === 'saved' ? (
    <Icon as={LuBookmark} boxSize={3} color='fg.muted' flexShrink={0} aria-hidden />
  ) : (
    <Box as='span' boxSize={1.5} borderRadius='full' bg={`${census.tone}.500`} flexShrink={0} aria-hidden />
  )

const Chip = ({
  label,
  mark,
  dashed,
  muted,
  title,
  onClick,
}: {
  label: string
  mark: ReactNode
  dashed?: boolean
  muted?: boolean
  title: string
  onClick?: () => void
}) => (
  <chakra.button
    type='button'
    {...chipStyle}
    borderStyle={dashed ? 'dashed' : 'solid'}
    color={muted ? 'fg.muted' : 'fg'}
    bg={muted ? 'transparent' : 'bg'}
    borderColor={muted ? 'transparent' : 'border'}
    title={title}
    onClick={onClick}
  >
    {mark}
    <Text as='span' fontSize='inherit' truncate>
      {label}
    </Text>
  </chakra.button>
)

/**
 * Which census a change belongs to, in the timeline's right-hand column: one chip, a dashed "3 censuses"
 * that lists them, or a grey "Members list only". Clicking one filters the timeline to it.
 */
export const CensusChips = ({
  censuses,
  onSelect,
}: {
  censuses: CensusRef[]
  onSelect: (filter: CensusFilter) => void
}) => {
  const { t } = useTranslation()
  const filterBy = (label: string) =>
    t('activity.census.filter_by', { defaultValue: 'Show only {{name}}', name: label })

  if (!censuses.length) {
    const label = t('activity.census.none', { defaultValue: 'Members list only' })
    return (
      <Chip
        label={label}
        mark={<Icon as={LuUsers} boxSize={3} aria-hidden />}
        muted
        title={filterBy(label)}
        onClick={() => onSelect('none')}
      />
    )
  }

  if (censuses.length === 1) {
    const [census] = censuses
    return (
      <Chip
        label={census.label}
        mark={<CensusMark census={census} />}
        title={filterBy(census.label)}
        onClick={() => onSelect(census.key)}
      />
    )
  }

  const label = t('activity.census.many', {
    count: censuses.length,
    defaultValue_one: '{{count}} census',
    defaultValue_other: '{{count}} censuses',
  })
  return (
    <Popover.Root positioning={{ placement: 'bottom-end' }}>
      <Popover.Trigger asChild>
        <chakra.button type='button' {...chipStyle} borderStyle='dashed'>
          <Icon as={LuLayers} boxSize={3} color='fg.muted' aria-hidden />
          {label}
        </chakra.button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content w='260px' p={2}>
          <Text fontSize='xs' color='fg.muted' px={2} pb={1}>
            {t('activity.census.many_title', { defaultValue: 'This change reached:' })}
          </Text>
          <Stack as='ul' gap={0} m={0} p={0}>
            {censuses.map((census) => (
              <Box as='li' key={census.key} listStyleType='none'>
                <chakra.button
                  type='button'
                  display='flex'
                  alignItems='center'
                  gap={2}
                  w='full'
                  px={2}
                  py={1.5}
                  borderRadius='md'
                  fontSize='sm'
                  textAlign='start'
                  _hover={{ bg: 'bg.muted' }}
                  onClick={() => onSelect(census.key)}
                >
                  <CensusMark census={census} />
                  <Text as='span' fontSize='inherit' truncate>
                    {census.label}
                  </Text>
                </chakra.button>
              </Box>
            ))}
          </Stack>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  )
}
