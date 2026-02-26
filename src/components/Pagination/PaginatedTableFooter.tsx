import { Box, Text } from '@chakra-ui/react'
import { usePagination, useRoutedPagination } from '@vocdoni/react-providers'
import { Trans } from 'react-i18next'
import { Pagination, RoutedPagination } from '~components/vocdoni-ui'
import RowsPerPageSelect from './RowsPerPageSelect'

const getCurrentPage = (currentPage, lastPage) => {
  return Math.min(currentPage, lastPage)
}

const RoutedPaginatedTableFooter = () => {
  const { pagination, initialPage } = useRoutedPagination()

  if (!pagination) return null

  const currentPage = getCurrentPage(pagination.currentPage, pagination.lastPage)

  const page = initialPage === 0 ? currentPage + 1 : currentPage
  const total = initialPage === 0 ? pagination.lastPage + 1 : pagination.lastPage

  return (
    <Box
      display='flex'
      flexDirection={{ base: 'column', md: 'row' }}
      alignItems={{ base: 'flex-start', md: 'center' }}
      gap={5}
      justifyContent='space-between'
    >
      <RowsPerPageSelect />
      <Box
        display='flex'
        flexDirection={{ base: 'column', md: 'row' }}
        alignItems={{ base: 'flex-start', md: 'center' }}
        gap={5}
      >
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
  const { pagination, initialPage } = usePagination()

  if (!pagination) return null

  const currentPage = getCurrentPage(pagination.currentPage, pagination.lastPage)

  const page = initialPage === 0 ? currentPage + 1 : currentPage
  const total = initialPage === 0 ? pagination.lastPage + 1 : pagination.lastPage

  return (
    <Box display='flex' flexDirection='row' alignItems='center' gap={5} justifyContent='space-between'>
      <Box display='flex' flexDirection='row' alignItems='center' gap={5}>
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
