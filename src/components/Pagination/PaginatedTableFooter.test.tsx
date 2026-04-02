import { render, screen } from '~src/test-utils'
import type { ReactNode } from 'react'
import RoutedPaginatedTableFooter from './PaginatedTableFooter'

const mockUseRoutedPagination = vi.fn()

const serializeResponsiveProp = (value: unknown) => {
  if (value == null) return ''
  return typeof value === 'string' ? value : JSON.stringify(value)
}

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual<typeof import('@chakra-ui/react')>('@chakra-ui/react')
  const React = await vi.importActual<typeof import('react')>('react')

  return {
    ...actual,
    Box: ({
      children,
      display,
      flexDirection,
      flexWrap,
      alignItems,
      justifyContent,
      ...props
    }: {
      children?: ReactNode
      display?: unknown
      flexDirection?: unknown
      flexWrap?: unknown
      alignItems?: unknown
      justifyContent?: unknown
      [key: string]: unknown
    }) =>
      React.createElement(
        'div',
        {
          'data-display': serializeResponsiveProp(display),
          'data-flex-direction': serializeResponsiveProp(flexDirection),
          'data-flex-wrap': serializeResponsiveProp(flexWrap),
          'data-align-items': serializeResponsiveProp(alignItems),
          'data-justify-content': serializeResponsiveProp(justifyContent),
          ...props,
        },
        children
      ),
    Text: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) =>
      React.createElement('span', props, children),
  }
})

vi.mock('@vocdoni/react-components/pagination', () => ({
  RoutedPagination: () => <div>Pagination</div>,
  Pagination: () => <div>Pagination</div>,
  usePagination: () => ({ pagination: null, initialPage: 1 }),
  useRoutedPagination: () => mockUseRoutedPagination(),
}))

vi.mock('./RowsPerPageSelect', () => ({
  default: () => <div>RowsPerPageSelect</div>,
}))

describe('RoutedPaginatedTableFooter', () => {
  beforeEach(() => {
    mockUseRoutedPagination.mockReturnValue({
      initialPage: 1,
      pagination: {
        currentPage: 1,
        lastPage: 3,
      },
    })
  })

  it('uses wrapping rows instead of a forced mobile column layout', () => {
    const { container } = render(<RoutedPaginatedTableFooter />)

    expect(screen.getByText('RowsPerPageSelect')).toBeInTheDocument()
    expect(screen.getByText('Pagination')).toBeInTheDocument()

    const wrappers = container.querySelectorAll('div[data-display="flex"]')
    const [root, controls] = Array.from(wrappers)

    expect(root).toHaveAttribute('data-flex-direction', 'row')
    expect(root).toHaveAttribute('data-flex-wrap', 'wrap')
    expect(controls).toHaveAttribute('data-flex-direction', 'row')
    expect(controls).toHaveAttribute('data-flex-wrap', 'wrap')
  })
})
