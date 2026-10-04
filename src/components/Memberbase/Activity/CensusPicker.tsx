import { Box, chakra, Icon, Input, Popover, Stack, Text } from '@chakra-ui/react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LuCheck, LuChevronDown, LuLayers, LuSearch, LuUsers } from 'react-icons/lu'
import { CensusMark } from './CensusChip'
import type { CensusDirectory, CensusFilter } from './censusRefs'

// Case- and accent-insensitive, so "assemblea" finds "Assembléa"
const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()

const Option = ({
  selected,
  mark,
  label,
  onClick,
}: {
  selected: boolean
  mark: ReactNode
  label: string
  onClick: () => void
}) => (
  <Box as='li' listStyleType='none'>
    <chakra.button
      type='button'
      role='option'
      aria-selected={selected}
      display='flex'
      alignItems='center'
      gap={2}
      w='full'
      px={2}
      py={1.5}
      borderRadius='md'
      fontSize='sm'
      textAlign='start'
      bg={selected ? 'bg.muted' : undefined}
      _hover={{ bg: 'bg.muted' }}
      onClick={onClick}
    >
      <Box w={3} display='inline-flex' justifyContent='center' flexShrink={0}>
        {selected ? <Icon as={LuCheck} boxSize={3} aria-hidden /> : mark}
      </Box>
      <Text as='span' fontSize='inherit' truncate>
        {label}
      </Text>
    </chakra.button>
  </Box>
)

const GroupTitle = ({ children }: { children: ReactNode }) => (
  <Text as='li' listStyleType='none' fontSize='xs' fontWeight='bold' color='fg.muted' px={2} pt={2} pb={1}>
    {children}
  </Text>
)

/**
 * The timeline's census filter: every census, the changes that reached none ("Members list only"),
 * or one census, picked from the votes' censuses and the saved ones, with a search.
 */
export const CensusPicker = ({
  directory,
  value,
  onChange,
}: {
  directory: CensusDirectory
  value: CensusFilter
  onChange: (value: CensusFilter) => void
}) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const query = fold(search.trim())
  const match = (label: string) => !query || fold(label).includes(query)
  const votes = directory.votes.filter((census) => match(census.label))
  const saved = directory.saved.filter((census) => match(census.label))

  const allLabel = t('activity.census.all', { defaultValue: 'All censuses' })
  const noneLabel = t('activity.census.none', { defaultValue: 'Members list only' })
  const current =
    value === 'all' ? allLabel : value === 'none' ? noneLabel : (directory.byKey.get(value)?.label ?? allLabel)

  const pick = (next: CensusFilter) => {
    onChange(next)
    setOpen(false)
    setSearch('')
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(details) => setOpen(details.open)}
      positioning={{ placement: 'bottom-start' }}
    >
      <Popover.Trigger asChild>
        <chakra.button
          type='button'
          display='inline-flex'
          alignItems='center'
          gap={2}
          h={8}
          px={3}
          w={{ base: 'full', sm: '260px' }}
          borderWidth='1px'
          borderColor='border'
          borderRadius='md'
          bg='bg'
          fontSize='sm'
          _hover={{ bg: 'bg.muted' }}
          aria-label={t('activity.census.picker_label', { defaultValue: 'Census: {{name}}', name: current })}
        >
          <Icon as={LuLayers} boxSize={4} color='fg.muted' aria-hidden />
          <Text as='span' fontSize='inherit' color='fg.muted'>
            {t('activity.census.picker', { defaultValue: 'Census' })}
          </Text>
          <Text as='span' fontSize='inherit' flex='1' textAlign='start' truncate>
            {current}
          </Text>
          <Icon as={LuChevronDown} boxSize={4} color='fg.muted' aria-hidden />
        </chakra.button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content w={{ base: 'calc(100vw - 32px)', sm: '300px' }} p={2}>
          <Box position='relative' mb={1}>
            <Icon
              as={LuSearch}
              boxSize={4}
              color='fg.muted'
              position='absolute'
              insetStart={2.5}
              top='50%'
              transform='translateY(-50%)'
              aria-hidden
            />
            <Input
              size='sm'
              ps={8}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('activity.census.search', { defaultValue: 'Find a census or vote' })}
              aria-label={t('activity.census.search', { defaultValue: 'Find a census or vote' })}
            />
          </Box>
          <Stack as='ul' role='listbox' gap={0} m={0} p={0} maxH='320px' overflowY='auto'>
            {!query && (
              <>
                <Option selected={value === 'all'} mark={null} label={allLabel} onClick={() => pick('all')} />
                <Option
                  selected={value === 'none'}
                  mark={<Icon as={LuUsers} boxSize={3} color='fg.muted' aria-hidden />}
                  label={noneLabel}
                  onClick={() => pick('none')}
                />
              </>
            )}
            {!!votes.length && <GroupTitle>{t('activity.census.in_votes', { defaultValue: 'In votes' })}</GroupTitle>}
            {votes.map((census) => (
              <Option
                key={census.key}
                selected={value === census.key}
                mark={<CensusMark census={census} />}
                label={census.label}
                onClick={() => pick(census.key)}
              />
            ))}
            {!!saved.length && <GroupTitle>{t('activity.census.saved', { defaultValue: 'Saved' })}</GroupTitle>}
            {saved.map((census) => (
              <Option
                key={census.key}
                selected={value === census.key}
                mark={<CensusMark census={census} />}
                label={census.label}
                onClick={() => pick(census.key)}
              />
            ))}
            {!!query && !votes.length && !saved.length && (
              <Text as='li' listStyleType='none' fontSize='sm' color='fg.muted' px={2} py={2}>
                {t('activity.census.no_match', { defaultValue: 'No census matches' })}
              </Text>
            )}
          </Stack>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  )
}
