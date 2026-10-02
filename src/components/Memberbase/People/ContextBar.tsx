import { Flex, Icon, Text, VisuallyHidden } from '@chakra-ui/react'
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
      <Text as='span' aria-hidden='true' color='fg.muted'>
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
        {t('members.readiness.unreachable', {
          defaultValue_one: '{{formattedCount}} has no email or mobile',
          defaultValue_other: '{{formattedCount}} have no email or mobile',
          count: readiness.unreachable,
          formattedCount: format(readiness.unreachable),
        })}
      </Text>
      <ComingSoonButton
        feature='members_show_flagged'
        surface='people_readiness'
        flexShrink={0}
        label={t('members.readiness.show_them', { defaultValue: 'Show them' })}
        title={t('members.readiness.show_them_title', { defaultValue: 'See who can’t get a voting code' })}
        description={t('members.readiness.show_them_description', {
          defaultValue: 'Soon you’ll see the people without an email or mobile in one list, to fix them before a vote.',
        })}
      />
    </>
  )
}

type ContextBarProps = {
  /** How much of the page is selected */
  pageSelection: PageSelectionState
  /** Rows on the page */
  pageSize: number
  /** What the bar says when nothing is selected (sign-in readiness) */
  children?: ReactNode
}

/**
 * One 40px line above the rows that says one thing at a time and never changes height: what's
 * selected on the page, or by default how many members can get a voting code.
 */
export const ContextBar = ({ pageSelection, pageSize, children }: ContextBarProps) => {
  const { t, i18n } = useTranslation()
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)

  return (
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
      {pageSelection.some ? (
        <Text fontSize='sm' fontVariantNumeric='tabular-nums' truncate>
          {pageSelection.all
            ? t('members.people.page_all_selected', {
                defaultValue_one: 'The {{formattedCount}} person on this page is selected',
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
      ) : (
        children
      )}
    </Flex>
  )
}
