import { Box, Button, Flex, IconButton, Stack, Tabs, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuX } from 'react-icons/lu'
import { MemberPicker } from '~components/Memberbase/Censuses/MemberPicker'
import { memberDisplayName } from '~components/Memberbase/People/display'
import type { SelectedMember } from '~components/Memberbase/People/useSelection'
import { Sheet } from '~components/ui/Sheet'

type ChoosePeopleSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Resolves with whether the census was made: the sheet stays open when it wasn't */
  onConfirm: (memberIds: string[]) => Promise<boolean>
  busy: boolean
}

/**
 * "Choose people": search the members and tick them, check the ones picked so far in
 * "Selected", and make the vote's census of them.
 */
export const ChoosePeopleSheet = ({ open, onOpenChange, onConfirm, busy }: ChoosePeopleSheetProps) => {
  const { t, i18n } = useTranslation()
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)
  const [tab, setTab] = useState<'find' | 'selected'>('find')
  const [selected, setSelected] = useState<Map<string, SelectedMember>>(() => new Map())

  useEffect(() => {
    if (open) return
    setSelected(new Map())
    setTab('find')
  }, [open])

  const remove = (id: string) => {
    const next = new Map(selected)
    next.delete(id)
    setSelected(next)
  }

  const confirm = async () => {
    if (await onConfirm([...selected.keys()])) onOpenChange(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : !busy && onOpenChange(false))}
      title={t('process_create.census.choose.title', { defaultValue: 'Choose who can vote' })}
      footer={
        <Flex justify='flex-end' gap={2} w='full'>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={busy}>
            {t('members.bulk.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button onClick={confirm} loading={busy} disabled={!selected.size}>
            {t('process_create.census.choose.submit', {
              count: selected.size,
              formattedCount: format(selected.size),
              defaultValue_one: 'Use 1 person',
              defaultValue_other: 'Use {{formattedCount}} people',
            })}
          </Button>
        </Flex>
      }
    >
      <Stack gap={4}>
        <Text fontSize='sm' color='fg.muted'>
          {t('process_create.census.choose.hint', {
            defaultValue: 'This vote gets its own census of them. Your members stay as they are.',
          })}
        </Text>
        <Tabs.Root value={tab} onValueChange={({ value }) => setTab(value as 'find' | 'selected')} variant='line'>
          <Tabs.List>
            <Tabs.Trigger value='find'>
              {t('process_create.census.choose.find', { defaultValue: 'Find people' })}
            </Tabs.Trigger>
            <Tabs.Trigger value='selected'>
              {t('process_create.census.choose.selected', {
                defaultValue: 'Selected ({{count}})',
                count: selected.size,
              })}
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value='find'>
            <MemberPicker selected={selected} onChange={setSelected} />
          </Tabs.Content>
          <Tabs.Content value='selected'>
            {selected.size === 0 ? (
              <Text fontSize='sm' color='fg.muted' py={4} textAlign='center'>
                {t('process_create.census.choose.none', { defaultValue: 'Nobody selected yet.' })}
              </Text>
            ) : (
              // ph-no-capture: member names and emails
              <Stack as='ul' gap={0} listStyleType='none' m={0} p={0} className='ph-no-capture'>
                {[...selected.values()].map((member) => {
                  const name = memberDisplayName(member)
                  return (
                    <Flex
                      as='li'
                      key={member.id}
                      align='center'
                      gap={2}
                      py={2}
                      borderBottom='1px solid'
                      borderColor='border'
                    >
                      <Box flex='1' minW={0}>
                        <Text fontSize='sm' truncate>
                          {name}
                        </Text>
                        <Text fontSize='xs' color='fg.muted' truncate>
                          {[member.email, member.memberNumber].filter(Boolean).join(' · ')}
                        </Text>
                      </Box>
                      <IconButton
                        size='xs'
                        variant='ghost'
                        colorPalette='gray'
                        aria-label={t('process_create.census.choose.remove', {
                          defaultValue: 'Remove {{name}}',
                          name,
                        })}
                        onClick={() => remove(member.id)}
                      >
                        <LuX />
                      </IconButton>
                    </Flex>
                  )
                })}
              </Stack>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </Stack>
    </Sheet>
  )
}
