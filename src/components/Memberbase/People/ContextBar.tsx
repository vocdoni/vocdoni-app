import { Box, Flex, Icon, Text, VisuallyHidden } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LuTriangleAlert } from 'react-icons/lu'
import { ComingSoonButton } from '~components/ui/ComingSoon'
import { useSignInReadiness } from '~src/queries/members'
import type { PageSelectionState } from './useSelection'

/**
 * "1,719 of 1,742 can get a voting code · ⚠ 23 have no email or mobile · Show them". Says nothing
 * when readiness can't be worked out.
 */
export const ReadinessMessage = () => {
  const { t, i18n } = useTranslation()
  const readiness = useSignInReadiness()
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)

  if (!readiness.available) return null

  const unreachableText = t('members.readiness.unreachable', {
    defaultValue_one: '{{formattedCount}} has no email or mobile',
    defaultValue_other: '{{formattedCount}} have no email or mobile',
    count: readiness.unreachable,
    formattedCount: format(readiness.unreachable),
  })

  if (!readiness.unreachable)
    return (
      <Text fontSize='sm' fontVariantNumeric='tabular-nums' truncate>
        {t('members.readiness.all', {
          defaultValue_one: 'Your member can get a voting code',
          defaultValue_other: 'All {{formattedCount}} can get a voting code',
          count: readiness.total,
          formattedCount: format(readiness.total),
        })}
      </Text>
    )

  return (
    <>
      <Text fontSize='sm' fontVariantNumeric='tabular-nums' truncate flexShrink={1} minW={0}>
        {t('members.readiness.ready', {
          defaultValue: '{{ready}} of {{total}} can get a voting code',
          ready: format(readiness.ready),
          total: format(readiness.total),
        })}
      </Text>
      <Text as='span' aria-hidden='true' color='fg.muted' hideBelow='md'>
        ·
      </Text>
      <Text
        as='span'
        fontSize='sm'
        color='fg.warning'
        fontVariantNumeric='tabular-nums'
        display='inline-flex'
        alignItems='center'
        gap={1}
        flexShrink={0}
      >
        <Icon as={LuTriangleAlert} boxSize={3.5} aria-hidden />
        <VisuallyHidden>{t('members.readiness.warning', { defaultValue: 'Warning:' })}</VisuallyHidden>
        {/* Phones get the count alone; the sentence stays for screen readers */}
        <Box as='span' hideFrom='md' aria-hidden='true'>
          {format(readiness.unreachable)}
        </Box>
        <Box as='span' hideBelow='md'>
          {unreachableText}
        </Box>
        <VisuallyHidden hideFrom='md'>{unreachableText}</VisuallyHidden>
      </Text>
      <Box hideBelow='md' flexShrink={0}>
        <ComingSoonButton
          feature='members_show_flagged'
          surface='people_readiness'
          label={t('members.readiness.show_them', { defaultValue: 'Show them' })}
          title={t('members.readiness.show_them_title', { defaultValue: 'See who can’t get a voting code' })}
          description={t('members.readiness.show_them_description', {
            defaultValue:
              'Soon you’ll see the people without an email or mobile in one list, to fix them before a vote.',
          })}
        />
      </Box>
    </>
  )
}

type PageSelectionMessageProps = {
  /** How much of the page is selected */
  pageSelection: PageSelectionState
  /** Rows on the page */
  pageSize: number
  /** After the sentence: "Select all 1,742" */
  children?: ReactNode
}

/** "All 25 on this page selected", or "3 of 25 on this page selected". */
export const PageSelectionMessage = ({ pageSelection, pageSize, children }: PageSelectionMessageProps) => {
  const { t, i18n } = useTranslation()
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)

  return (
    <>
      <Text fontSize='sm' fontVariantNumeric='tabular-nums' truncate flexShrink={1} minW={0}>
        {pageSelection.all
          ? t('members.people.page_all_selected', {
              defaultValue_one: 'The only person on this page is selected',
              defaultValue_other: 'All {{formattedCount}} on this page selected',
              count: pageSize,
              formattedCount: format(pageSize),
            })
          : t('members.people.page_some_selected', {
              defaultValue: '{{selected}} of {{total}} on this page selected',
              selected: format(pageSelection.selected),
              total: format(pageSize),
            })}
      </Text>
      {children}
    </>
  )
}

/** The dot between two parts of a context bar message, hidden from screen readers. */
export const Separator = () => (
  <Text as='span' aria-hidden='true' color='fg.muted'>
    ·
  </Text>
)

/**
 * One 40px line above the rows that says one thing at a time and never changes height: what's
 * selected on the page, progress, or by default how many members can get a voting code. The page
 * decides which message it shows.
 */
export const ContextBar = ({ children }: { children?: ReactNode }) => (
  <Flex
    h='40px'
    align='center'
    gap={2}
    px={4}
    borderBottomWidth='1px'
    borderColor='border'
    bg='bg.subtle'
    fontSize='sm'
    overflow='hidden'
    whiteSpace='nowrap'
  >
    {children}
  </Flex>
)
