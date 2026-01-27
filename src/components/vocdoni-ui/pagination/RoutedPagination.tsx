import { Button, ButtonGroup, type ButtonGroupProps, type ButtonProps } from '@chakra-ui/react'
import { useRoutedPagination } from '@vocdoni/react-providers'
import { Link as RouterLink } from 'react-router-dom'

type PaginationState = {
  lastPage: number
  totalItems?: number
}

export type PaginationProps = ButtonGroupProps & {
  maxButtons?: number | false
  buttonProps?: ButtonProps
  inputProps?: ButtonProps
  pagination: PaginationState
}

const getTotalPages = (pagination: PaginationState, initialPage: number) =>
  initialPage === 0 ? pagination.lastPage + 1 : pagination.lastPage

const getCurrentPage = (page: number, initialPage: number) => (initialPage === 0 ? page - 1 : page)

export const RoutedPagination = ({ maxButtons = 10, buttonProps, pagination, ...rest }: PaginationProps) => {
  const { getPathForPage, setPage, page, initialPage } = useRoutedPagination()
  const totalPages = getTotalPages(pagination, initialPage)
  const currentPage = getCurrentPage(page, initialPage)
  const pages = Array.from({ length: totalPages }, (_, index) => index)
  const visiblePages = maxButtons === false ? pages : pages.slice(0, maxButtons)

  return (
    <ButtonGroup {...rest}>
      {visiblePages.map((pageIndex) => (
        <Button
          key={pageIndex}
          asChild
          onClick={() => setPage(pageIndex)}
          aria-current={pageIndex === currentPage ? 'page' : undefined}
          {...buttonProps}
        >
          <RouterLink to={getPathForPage(pageIndex + 1)}>{pageIndex + 1}</RouterLink>
        </Button>
      ))}
    </ButtonGroup>
  )
}
