import { Box, Button, Collapsible, Field, Flex, Icon, List, Stack, Text, Textarea } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuChevronDown } from 'react-icons/lu'
import { Banner } from '~components/ui/Banner'
import { Sheet } from '~components/ui/Sheet'
import {
  type CollectedMember,
  isAbortError,
  MEMBERS_COLLECT_CAP,
  MEMBERS_PAGE_MAX,
  useLoadMemberIndex,
  useMembersPageFetcher,
} from '~src/queries/members'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import {
  matchPastedValues,
  matchPastedValuesRemotely,
  parsePastedValues,
  PASTE_REMOTE_MAX_VALUES,
  type PasteMatch,
} from './pasteMatch'

type Step =
  | { name: 'edit' }
  | { name: 'matching'; done: number; total: number; loadingIndex: boolean }
  | { name: 'result'; match: PasteMatch; skipped: number }
  | { name: 'error' }

type PasteSelectSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Everyone in the organization: up to 5,000 are matched in memory, past that value by value */
  total: number
  onSelect: (members: CollectedMember[]) => void
}

/**
 * "Select from a list…": paste a column of member numbers, emails or national IDs and select the
 * people it names. Matches are exact, never the partial matches search finds.
 */
export const PasteSelectSheet = ({ open, onOpenChange, total, onSelect }: PasteSelectSheetProps) => {
  const { t, i18n } = useTranslation()
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)
  const [text, setText] = useState('')
  const [step, setStep] = useState<Step>({ name: 'edit' })
  const controller = useRef<AbortController | null>(null)
  const loadIndex = useLoadMemberIndex()
  const fetchPage = useMembersPageFetcher()
  const values = useMemo(() => parsePastedValues(text), [text])
  const remote = total > MEMBERS_COLLECT_CAP
  const checkable = remote ? values.slice(0, PASTE_REMOTE_MAX_VALUES) : values

  const stop = () => {
    controller.current?.abort()
    controller.current = null
  }

  useEffect(() => {
    if (open) return
    stop()
    setText('')
    setStep({ name: 'edit' })
  }, [open])

  useEffect(() => stop, [])

  const find = async () => {
    stop()
    const current = new AbortController()
    controller.current = current
    try {
      let match: PasteMatch
      if (remote) {
        setStep({ name: 'matching', done: 0, total: checkable.length, loadingIndex: false })
        match = await matchPastedValuesRemotely(
          checkable,
          async (value) => (await fetchPage({ page: 1, limit: MEMBERS_PAGE_MAX, search: value })).members ?? [],
          {
            signal: current.signal,
            onProgress: (done) => setStep({ name: 'matching', done, total: checkable.length, loadingIndex: false }),
          }
        )
      } else {
        setStep({ name: 'matching', done: 0, total, loadingIndex: true })
        const index = await loadIndex({
          signal: current.signal,
          onProgress: ({ collected, total: all }) =>
            setStep({ name: 'matching', done: collected, total: all, loadingIndex: true }),
        })
        if (current.signal.aborted) return
        match = matchPastedValues(checkable, index.members)
      }
      setStep({ name: 'result', match, skipped: values.length - checkable.length })
    } catch (error) {
      if (isAbortError(error) || current.signal.aborted) {
        setStep({ name: 'edit' })
        return
      }
      setStep({ name: 'error' })
    } finally {
      if (controller.current === current) controller.current = null
    }
  }

  const select = (match: PasteMatch) => {
    trackAnalyticsEvent({
      name: AnalyticsEvents.MembersPasteSelect,
      props: { found: match.found.length, not_found: match.notFound.length },
    })
    onSelect(match.found)
    onOpenChange(false)
  }

  const footer = (() => {
    if (step.name === 'matching')
      return (
        <Flex justify='flex-end' w='full'>
          <Button variant='outline' onClick={stop}>
            {t('members.paste.stop', { defaultValue: 'Stop' })}
          </Button>
        </Flex>
      )
    if (step.name === 'result')
      return (
        <Flex justify='flex-end' gap={2} w='full'>
          <Button variant='outline' onClick={() => setStep({ name: 'edit' })}>
            {t('members.paste.edit', { defaultValue: 'Edit the list' })}
          </Button>
          <Button onClick={() => select(step.match)} disabled={!step.match.found.length}>
            {t('members.paste.select', { defaultValue: 'Select them' })}
          </Button>
        </Flex>
      )
    return (
      <Flex justify='flex-end' gap={2} w='full'>
        <Button variant='outline' onClick={() => onOpenChange(false)}>
          {t('members.paste.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button onClick={find} disabled={!values.length}>
          {t('members.paste.find', { defaultValue: 'Find them' })}
        </Button>
      </Flex>
    )
  })()

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      size='sm'
      title={t('members.paste.title', { defaultValue: 'Select from a list' })}
      footer={footer}
    >
      {step.name === 'result' ? (
        <Stack gap={4}>
          <Text fontSize='lg' fontWeight='bolder' fontVariantNumeric='tabular-nums' role='status'>
            {t('members.paste.found', { defaultValue: '{{found}} found', found: format(step.match.found.length) })}
            {step.match.notFound.length > 0 && (
              <Text as='span' color='fg.warning'>
                {' · '}
                {t('members.paste.not_found', {
                  defaultValue_one: '{{formattedCount}} not found',
                  defaultValue_other: '{{formattedCount}} not found',
                  count: step.match.notFound.length,
                  formattedCount: format(step.match.notFound.length),
                })}
              </Text>
            )}
          </Text>
          {step.match.notFound.length > 0 && (
            <Collapsible.Root>
              <Collapsible.Trigger asChild>
                <Button size='sm' variant='plain' px={0} color='fg.info' w='fit-content'>
                  {t('members.paste.show_not_found', { defaultValue: 'Show not found' })}
                  <Icon as={LuChevronDown} />
                </Button>
              </Collapsible.Trigger>
              <Collapsible.Content>
                {/* ph-no-capture: what was pasted is member data */}
                <List.Root
                  className='ph-no-capture'
                  fontSize='sm'
                  maxH='240px'
                  overflowY='auto'
                  ps={4}
                  mt={2}
                  borderWidth='1px'
                  borderColor='border'
                  borderRadius='md'
                  py={2}
                >
                  {step.match.notFound.map((value) => (
                    <List.Item key={value}>{value}</List.Item>
                  ))}
                </List.Root>
              </Collapsible.Content>
            </Collapsible.Root>
          )}
          {step.skipped > 0 && (
            <Text fontSize='sm' color='fg.muted'>
              {t('members.paste.skipped', {
                defaultValue_one: 'One more value wasn’t checked: paste up to {{max}} at a time.',
                defaultValue_other: '{{count}} more values weren’t checked: paste up to {{max}} at a time.',
                count: step.skipped,
                max: PASTE_REMOTE_MAX_VALUES,
              })}
            </Text>
          )}
          <Text fontSize='sm' color='fg.muted'>
            {t('members.paste.adds', { defaultValue: 'They’re added to the people already selected.' })}
          </Text>
        </Stack>
      ) : (
        <Stack gap={4}>
          {step.name === 'error' && (
            <Banner status='error'>
              {t('members.paste.error', { defaultValue: "We couldn't check the list. Try again." })}
            </Banner>
          )}
          <Field.Root disabled={step.name === 'matching'}>
            <Field.Label>
              {t('members.paste.label', { defaultValue: 'Member numbers, emails or national IDs' })}
            </Field.Label>
            <Textarea
              className='ph-no-capture'
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={10}
              autoComplete='off'
              spellCheck={false}
              fontSize={{ base: 'md', md: 'sm' }}
              fontFamily='mono'
            />
            <Field.HelperText>
              {t('members.paste.help', {
                defaultValue:
                  'Paste a column from your spreadsheet. One per line, or separated by commas or semicolons.',
              })}
            </Field.HelperText>
          </Field.Root>
          {values.length > 0 && (
            <Text fontSize='sm' color='fg.muted' fontVariantNumeric='tabular-nums'>
              {t('members.paste.count', {
                defaultValue_one: 'One value',
                defaultValue_other: '{{formattedCount}} different values',
                count: values.length,
                formattedCount: format(values.length),
              })}
            </Text>
          )}
          {remote && values.length > PASTE_REMOTE_MAX_VALUES && (
            <Banner status='warning'>
              {t('members.paste.remote_limit', {
                defaultValue:
                  'With more than {{cap}} members, we check up to {{max}} values at a time. The first {{max}} will be checked.',
                cap: format(MEMBERS_COLLECT_CAP),
                max: PASTE_REMOTE_MAX_VALUES,
              })}
            </Banner>
          )}
          {step.name === 'matching' && (
            <Box role='status' fontSize='sm' fontVariantNumeric='tabular-nums'>
              {step.loadingIndex
                ? t('members.paste.loading_members', {
                    defaultValue: 'Loading your members… {{done}} of {{total}}',
                    done: format(step.done),
                    total: format(step.total),
                  })
                : t('members.paste.checking', {
                    defaultValue: 'Checking {{done}} of {{total}}…',
                    done: format(step.done),
                    total: format(step.total),
                  })}
            </Box>
          )}
        </Stack>
      )}
    </Sheet>
  )
}
