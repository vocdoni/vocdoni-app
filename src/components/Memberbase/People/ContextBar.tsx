import { Flex, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { PageSelectionState } from './useSelection'

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
