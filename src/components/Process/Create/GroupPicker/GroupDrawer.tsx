import { Box, Drawer, Icon, Input, InputGroup, Link, Portal, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuPlus, LuSearch } from 'react-icons/lu'
import { Link as ReactRouterLink } from 'react-router-dom'
import { Routes } from '~routes'
import { Group } from '~src/queries/groups'
import { GroupCard } from './GroupCard'

export type GroupDrawerProps = {
  isOpen: boolean
  onClose: () => void
  groups: Group[]
  selectedId?: string
  onSelect: (groupId: string) => void
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetching: boolean
}

/**
 * Command-palette-style group chooser. Search, scroll-to-load, skeletons while
 * fetching, and a persistent "create a group" escape hatch.
 */
export const GroupDrawer = ({
  isOpen,
  onClose,
  groups,
  selectedId,
  onSelect,
  fetchNextPage,
  hasNextPage,
  isFetching,
}: GroupDrawerProps) => {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return groups
    return groups.filter((g) => g.title?.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q))
  }, [groups, query])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (hasNextPage && !isFetching && el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
      fetchNextPage()
    }
  }

  return (
    <Drawer.Root open={isOpen} onOpenChange={({ open }) => (!open ? onClose() : undefined)} size='md'>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.CloseTrigger />
            <Drawer.Header display='flex' flexDirection='column' alignItems='stretch' gap={3}>
              <Drawer.Title>{t('voter_auth.group.drawer_title', { defaultValue: 'Choose a group' })}</Drawer.Title>
              <InputGroup w='full' startElement={<Icon as={LuSearch} color='texts.subtle' />}>
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('voter_auth.group.search_placeholder', { defaultValue: 'Search groups…' })}
                />
              </InputGroup>
            </Drawer.Header>
            <Drawer.Body onScroll={handleScroll}>
              <VStack align='stretch' gap={3}>
                {filtered.map((group, index) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    index={index}
                    isSelected={group.id === selectedId}
                    onSelect={() => {
                      onSelect(group.id)
                      onClose()
                    }}
                  />
                ))}

                {isFetching &&
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={`sk-${i}`} h='72px' borderRadius='lg' />)}

                {!isFetching && filtered.length === 0 && (
                  <VStack py={8} gap={1}>
                    <Text fontSize='sm' color='texts.subtle' textAlign='center'>
                      {query
                        ? t('voter_auth.group.no_results', {
                            defaultValue: 'No groups match "{{query}}"',
                            query,
                          })
                        : t('voter_auth.group.empty', { defaultValue: 'No groups yet' })}
                    </Text>
                  </VStack>
                )}
              </VStack>
            </Drawer.Body>
            <Drawer.Footer>
              <Link asChild>
                <ReactRouterLink to={Routes.dashboard.memberbase.base}>
                  <Box as='span' display='inline-flex' alignItems='center' gap={1.5}>
                    <Icon as={LuPlus} boxSize={4} />
                    {t('voter_auth.group.create_new', { defaultValue: 'Create a new group' })}
                  </Box>
                </ReactRouterLink>
              </Link>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}
