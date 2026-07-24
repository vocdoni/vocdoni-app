import { Box, Text } from '@chakra-ui/react'
import { Pagination, RoutedPagination, usePagination, useRoutedPagination } from '@vocdoni/react-components'
import { Trans } from 'react-i18next'
import RowsPerPageSelect from './RowsPerPageSelect'

// Clamp the displayed page to the known last page, guarding against a
// stale/out-of-range page (e.g. a bookmarked ?page=9 of a list that now has
// fewer pages) while lastPage is still 0/undefined during loading.
const getCurrentPage = (page: number, lastPage: number) => (lastPage ? Math.max(1, Math.min(page, lastPage)) : page)

const RoutedPaginatedTableFooter = () => {
  const { pagination, page } = useRoutedPagination()

  if (!pagination) return null

  const total = pagination.lastPage
  const currentPage = getCurrentPage(page, total)

  return (
    <Box
      display='flex'
      flexDirection='row'
      flexWrap='wrap'
      alignItems='center'
      gap={5}
      justifyContent={{ base: 'flex-start', md: 'space-between' }}
    >
      <RowsPerPageSelect />
      <Box display='flex' flexDirection='row' flexWrap='wrap' alignItems='center' gap={5}>
        <Text fontSize='sm'>
          <Trans i18nKey='pagination.page_out_of' values={{ page: currentPage, total }}>
            Page {{ page: currentPage }} of {{ total }}
          </Trans>
        </Text>
        <RoutedPagination
          pagination={pagination}
          buttonProps={{ size: 'xs', colorScheme: 'gray', variant: 'outline', marginInlineStart: 0 }}
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
    <Box display='flex' flexDirection='row' flexWrap='wrap' alignItems='center' gap={5} justifyContent='space-between'>
      <Box display='flex' flexDirection='row' flexWrap='wrap' alignItems='center' gap={5}>
        <Text fontSize='sm'>
          <Trans i18nKey='pagination.page_out_of' values={{ page: currentPage, total }}>
            Page {{ page: currentPage }} of {{ total }}
          </Trans>
        </Text>
        <Pagination pagination={pagination} buttonProps={{ size: 'xs', colorScheme: 'gray', variant: 'outline' }} />
      </Box>
    </Box>
  )
}

export default RoutedPaginatedTableFooter
