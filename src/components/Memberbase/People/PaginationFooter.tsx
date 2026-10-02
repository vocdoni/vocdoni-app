import { Flex, IconButton, NativeSelect, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { PAGE_SIZES } from './urlState'

type PaginationFooterProps = {
  page: number
  lastPage: number
  size: number
  total: number
  /** Rows on this page */
  shown: number
  searching: boolean
  onPage: (page: number) => void
  onSize: (size: number) => void
}

export const PaginationFooter = ({
  page,
  lastPage,
  size,
  total,
  shown,
  searching,
  onPage,
  onSize,
}: PaginationFooterProps) => {
  const { t, i18n } = useTranslation()
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)
  const from = total ? (page - 1) * size + 1 : 0
  const to = total ? from + shown - 1 : 0
  const pages = Math.max(1, lastPage)

  return (
    <Flex
      align='center'
      justify='space-between'
      gap={3}
      wrap='wrap'
      px={4}
      py={3}
      borderTopWidth='1px'
      borderColor='border'
      fontSize='sm'
    >
      <Text fontSize='sm' color='fg.muted' fontVariantNumeric='tabular-nums'>
        {searching
          ? t('members.people.range_results', {
              defaultValue_one: '{{from}}–{{to}} of {{total}} result',
              defaultValue_other: '{{from}}–{{to}} of {{total}} results',
              count: total,
              from: format(from),
              to: format(to),
              total: format(total),
            })
          : t('members.people.range_members', {
              defaultValue_one: '{{from}}–{{to}} of {{total}} member',
              defaultValue_other: '{{from}}–{{to}} of {{total}} members',
              count: total,
              from: format(from),
              to: format(to),
              total: format(total),
            })}
      </Text>
      <Flex align='center' gap={3}>
        <NativeSelect.Root size='xs' w='auto'>
          <NativeSelect.Field
            aria-label={t('pagination.rows_per_page', { defaultValue: 'Rows per page' })}
            value={String(size)}
            onChange={(event) => onSize(Number(event.target.value))}
          >
            {PAGE_SIZES.map((option) => (
              <option key={option} value={option}>
                {t('members.people.page_size', { defaultValue: '{{count}} per page', count: option })}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <Text fontSize='sm' fontVariantNumeric='tabular-nums' whiteSpace='nowrap'>
          {t('pagination.page_out_of', { defaultValue: 'Page {{page}} of {{total}}', page, total: pages })}
        </Text>
        <Flex gap={1}>
          <IconButton
            size='xs'
            variant='outline'
            aria-label={t('pagination.previous', { defaultValue: 'Previous page' })}
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
          >
            <LuChevronLeft />
          </IconButton>
          <IconButton
            size='xs'
            variant='outline'
            aria-label={t('pagination.next', { defaultValue: 'Next page' })}
            disabled={page >= pages}
            onClick={() => onPage(page + 1)}
          >
            <LuChevronRight />
          </IconButton>
        </Flex>
      </Flex>
    </Flex>
  )
}
