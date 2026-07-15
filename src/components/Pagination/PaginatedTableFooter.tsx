import { Box, Text } from '@chakra-ui/react'
import { Pagination, RoutedPagination, usePagination, useRoutedPagination } from '@vocdoni/react-components'
import { Trans } from 'react-i18next'
import RowsPerPageSelect from './RowsPerPageSelect'

const RoutedPaginatedTableFooter = () => {
  const { pagination, page } = useRoutedPagination()

  if (!pagination) return null

  const total = pagination.lastPage

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
  const { pagination, page } = usePagination()

  if (!pagination) return null

  const total = pagination.lastPage

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
