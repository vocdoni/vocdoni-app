import { Box, Text } from '@chakra-ui/react'
import { Pagination, RoutedPagination, usePagination, useRoutedPagination } from '@vocdoni/react-components'
import { Trans } from 'react-i18next'
import RowsPerPageSelect from './RowsPerPageSelect'

const RoutedPaginatedTableFooter = () => {
  const { pagination, initialPage, page: currentPage } = useRoutedPagination()

  if (!pagination) return null

  const page = initialPage === 0 ? currentPage + 1 : currentPage
  const total = initialPage === 0 ? pagination.lastPage + 1 : pagination.lastPage

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
          <Trans i18nKey='pagination.page_out_of' values={{ page, total }}>
            Page {{ page }} of {{ total }}
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
  const { pagination, initialPage, page: currentPage } = usePagination()

  if (!pagination) return null

  const page = initialPage === 0 ? currentPage + 1 : currentPage
  const total = initialPage === 0 ? pagination.lastPage + 1 : pagination.lastPage

  return (
    <Box display='flex' flexDirection='row' flexWrap='wrap' alignItems='center' gap={5} justifyContent='space-between'>
      <Box display='flex' flexDirection='row' flexWrap='wrap' alignItems='center' gap={5}>
        <Text fontSize='sm'>
          <Trans i18nKey='pagination.page_out_of' values={{ page, total }}>
            Page {{ page }} of {{ total }}
          </Trans>
        </Text>
        <Pagination pagination={pagination} buttonProps={{ size: 'xs', colorScheme: 'gray', variant: 'outline' }} />
      </Box>
    </Box>
  )
}

export default RoutedPaginatedTableFooter
