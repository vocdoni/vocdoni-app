import { Box, type BoxProps, Text } from '@chakra-ui/react'
import { Pagination, RoutedPagination, usePagination, useRoutedPagination } from '@vocdoni/react-components'
import type { ReactNode } from 'react'
import { Trans } from 'react-i18next'
import RowsPerPageSelect from './RowsPerPageSelect'

// Clamp the displayed page to the known last page, guarding against a
// stale/out-of-range page (e.g. a bookmarked ?page=9 of a list that now has
// fewer pages) while lastPage is still 0/undefined during loading.
const getCurrentPage = (page: number, lastPage: number) => (lastPage ? Math.max(1, Math.min(page, lastPage)) : page)

// Both footers lay their controls out in the same wrapping row.
const rowStyle: BoxProps = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: '5' }

const pageButtonProps = { size: 'xs', colorPalette: 'gray', variant: 'outline' } as const

const PageOutOf = ({ page, total }: { page: number; total: number }) => (
  <Text textStyle='body-sm'>
    <Trans i18nKey='pagination.page_out_of' values={{ page, total }}>
      Page {{ page }} of {{ total }}
    </Trans>
  </Text>
)

type RoutedPaginatedTableFooterProps = {
  // Optional context rendered before the page indicator, e.g. the range of rows on screen.
  summary?: ReactNode
}

const RoutedPaginatedTableFooter = ({ summary }: RoutedPaginatedTableFooterProps) => {
  const { pagination, page } = useRoutedPagination()

  if (!pagination) return null

  const total = pagination.lastPage
  const currentPage = getCurrentPage(page, total)

  return (
    <Box {...rowStyle} justifyContent={{ base: 'flex-start', md: 'space-between' }}>
      <RowsPerPageSelect />
      <Box {...rowStyle}>
        {summary}
        <PageOutOf page={currentPage} total={total} />
        <RoutedPagination
          pagination={pagination}
          buttonProps={{ ...pageButtonProps, marginInlineStart: 0 }}
          display='flex'
        />
      </Box>
    </Box>
  )
}

export const PaginatedTableFooter = () => {
  const { pagination, page } = usePagination()

  if (!pagination) return null

  const total = pagination.lastPage
  const currentPage = getCurrentPage(page, total)

  return (
    <Box {...rowStyle} justifyContent='space-between'>
      <Box {...rowStyle}>
        <PageOutOf page={currentPage} total={total} />
        <Pagination pagination={pagination} buttonProps={pageButtonProps} />
      </Box>
    </Box>
  )
}

export default RoutedPaginatedTableFooter
