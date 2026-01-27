import { Button, ButtonGroup, type ButtonGroupProps, type ButtonProps } from '@chakra-ui/react'
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

const getCurrentPage = (page: number, initialPage: number) => (initialPage === 0 ? page - 1 : page)

export const Pagination = ({ maxButtons = 10, buttonProps, pagination, ...rest }: PaginationProps) => {
  const { page, setPage, initialPage } = usePagination()
  const totalPages = getTotalPages(pagination, initialPage)
  const currentPage = getCurrentPage(page, initialPage)
  const pages = Array.from({ length: totalPages }, (_, index) => index)
  const visiblePages = maxButtons === false ? pages : pages.slice(0, maxButtons)

  return (
    <ButtonGroup {...rest}>
      {visiblePages.map((pageIndex) => {
        const displayPage = initialPage === 0 ? pageIndex + 1 : pageIndex + initialPage
        return (
          <Button
            key={pageIndex}
            onClick={() => setPage(displayPage)}
            aria-current={pageIndex === currentPage ? 'page' : undefined}
            {...buttonProps}
          >
            {pageIndex + 1}
          </Button>
        )
      })}
    </ButtonGroup>
  )
}
