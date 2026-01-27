import {
  Button,
  ButtonGroup,
  PaginationItem,
  PaginationRoot,
  type ButtonGroupProps,
  type ButtonProps,
} from '@chakra-ui/react'
import { usePagination } from '@vocdoni/react-providers'

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

const getRootPage = (page: number, initialPage: number) => (initialPage === 0 ? (page === 0 ? 1 : page) : page)

const getVisiblePages = (totalPages: number, maxButtons: number | false) => {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
  return maxButtons === false ? pages : pages.slice(0, maxButtons)
}

export const Pagination = ({ maxButtons = 10, buttonProps, pagination, ...rest }: PaginationProps) => {
  const { page, setPage, initialPage } = usePagination()
  const totalPages = getTotalPages(pagination, initialPage)
  const rootPage = getRootPage(page, initialPage)
  const visiblePages = getVisiblePages(totalPages, maxButtons)

  return (
    <PaginationRoot
      count={totalPages}
      pageSize={1}
      page={rootPage}
      onPageChange={(details) => setPage(details.page)}
      asChild
    >
      <ButtonGroup {...rest}>
        {visiblePages.map((pageValue) => (
          <PaginationItem key={pageValue} type='page' value={pageValue} asChild>
            <Button {...buttonProps}>{pageValue}</Button>
          </PaginationItem>
        ))}
      </ButtonGroup>
    </PaginationRoot>
  )
}
