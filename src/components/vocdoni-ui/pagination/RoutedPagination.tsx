import {
  ButtonGroup,
  Text,
  chakra,
  useSlotRecipe,
  type ButtonGroupProps,
  type ButtonProps,
  type InputProps,
} from '@chakra-ui/react'
import { useRoutedPagination } from '@vocdoni/react-providers'
import { useMemo, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import { PaginationButton } from './Button'
import { EllipsisButton } from './EllipsisButton'

type PaginationState = {
  lastPage: number
  totalItems?: number
}

export type PaginationProps = ButtonGroupProps & {
  maxButtons?: number | false
  buttonProps?: ButtonProps
  inputProps?: InputProps
  pagination: PaginationState
}

type PaginatorButtonProps = {
  pageNumber: number
  currentPage: number
  pageIndex?: number
} & ButtonProps

const RoutedPageButton = ({
  pageNumber,
  pageIndex,
  currentPage,
  to,
  ...rest
}: PaginatorButtonProps & { to: string }) => (
  <PaginationButton asChild data-active={currentPage === pageIndex ? '' : undefined} {...rest}>
    <RouterLink to={to}>{pageNumber + 1}</RouterLink>
  </PaginationButton>
)
RoutedPageButton.displayName = 'RoutedPageButton'

type CreatePageButtonType = (i: number) => ReactElement
type GotoPageType = (page: number) => void

const usePaginationPages = (
  currentPage: number,
  totalPages: number | undefined,
  maxButtons: number | undefined | false,
  gotoPage: GotoPageType,
  createPageButton: CreatePageButtonType,
  inputProps?: InputProps,
  buttonProps?: ButtonProps
) =>
  useMemo(() => {
    if (totalPages === undefined) return []

    const pages: ReactElement[] = []
    for (let i = 0; i < totalPages; i++) {
      pages.push(createPageButton(i))
    }

    if (!maxButtons || totalPages <= maxButtons) {
      return pages
    }

    const startEllipsis = (
      <EllipsisButton key='start-ellipsis' gotoPage={gotoPage} inputProps={inputProps} {...buttonProps} />
    )
    const endEllipsis = (
      <EllipsisButton key='end-ellipsis' gotoPage={gotoPage} inputProps={inputProps} {...buttonProps} />
    )

    const sideButtons = 2
    const availableButtons = maxButtons - sideButtons

    if (currentPage <= availableButtons / 2) {
      return [...pages.slice(0, availableButtons), endEllipsis, pages[totalPages - 1]]
    }
    if (currentPage >= totalPages - 1 - availableButtons / 2) {
      return [pages[0], startEllipsis, ...pages.slice(totalPages - availableButtons, totalPages)]
    }

    const startPage = currentPage - Math.floor((availableButtons - 1) / 2)
    const endPage = currentPage + Math.floor(availableButtons / 2)
    return [pages[0], startEllipsis, ...pages.slice(startPage, endPage - 1), endEllipsis, pages[totalPages - 1]]
  }, [totalPages, maxButtons, gotoPage, inputProps, buttonProps, currentPage, createPageButton])

const PaginationButtons = ({
  totalPages,
  totalItems,
  currentPage,
  goToPage,
  createPageButton,
  maxButtons = 10,
  buttonProps,
  inputProps,
  ...rest
}: {
  totalPages: number | undefined
  totalItems: number | undefined
  currentPage: number
  createPageButton: CreatePageButtonType
  goToPage: GotoPageType
} & ButtonGroupProps &
  Pick<PaginationProps, 'maxButtons' | 'buttonProps' | 'inputProps'>) => {
  const { t } = useTranslation()
  const recipe = useSlotRecipe({ key: 'Pagination' })
  const styles = recipe()
  const pages = usePaginationPages(
    currentPage,
    totalPages,
    maxButtons ? Math.max(5, maxButtons) : false,
    (page) => {
      if (page >= 0 && totalPages && page < totalPages) {
        goToPage(page)
      }
    },
    createPageButton,
    inputProps,
    buttonProps
  )

  return (
    <chakra.div css={styles.wrapper}>
      <ButtonGroup css={styles.buttonGroup} {...rest}>
        {totalPages === undefined ? (
          <>
            <PaginationButton onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0} {...buttonProps}>
              {t('pagination.previous', { defaultValue: 'Previous' })}
            </PaginationButton>
            <PaginationButton onClick={() => goToPage(currentPage + 1)} {...buttonProps}>
              {t('pagination.next', { defaultValue: 'Next' })}
            </PaginationButton>
          </>
        ) : (
          pages
        )}
      </ButtonGroup>
      {Boolean(totalItems) && (
        <Text css={styles.totalResults}>
          {t('pagination.total_results', {
            count: totalItems,
          })}
        </Text>
      )}
    </chakra.div>
  )
}

export const RoutedPagination = ({
  maxButtons = 10,
  buttonProps,
  inputProps,
  pagination,
  ...rest
}: PaginationProps) => {
  const { getPathForPage, setPage, page, initialPage } = useRoutedPagination()
  const totalPages = initialPage === 0 ? pagination.lastPage + 1 : pagination.lastPage
  const currentPage = initialPage === 0 ? page - 1 : page

  return (
    <PaginationButtons
      goToPage={(page) => setPage(page)}
      createPageButton={(i) => {
        const pageIndex = initialPage === 0 ? i : i + initialPage
        return (
          <RoutedPageButton
            key={i}
            to={getPathForPage(i + 1)}
            pageIndex={pageIndex}
            pageNumber={i}
            currentPage={currentPage}
            {...buttonProps}
          />
        )
      }}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={pagination.totalItems}
      maxButtons={maxButtons}
      buttonProps={buttonProps}
      inputProps={inputProps}
      {...rest}
    />
  )
}
