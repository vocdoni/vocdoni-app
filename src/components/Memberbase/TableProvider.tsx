import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

export type TableColumn = {
  id: string
  label: string
  visible?: boolean
}

type TableProviderProps = {
  data?: any[]
  error?: Error | null
  isLoading?: boolean
  isFetching?: boolean
  // True while the rows are the previous page/sort, kept on screen until the new ones arrive.
  isPlaceholderData?: boolean
  initialColumns: TableColumn[]
  children: ReactNode
}

export type SelectedRow = {
  id: string
  name: string
  surname: string
}

const STORAGE_KEY = 'table_columns_visibility'

const getStoredVisibleIds = (): Set<string> | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null
    return new Set<string>(JSON.parse(saved))
  } catch (e) {
    console.warn('Error reading column visibility from localStorage:', e)
    return null
  }
}

const computeColumns = (params: {
  initialColumns: TableColumn[]
  prevColumns?: TableColumn[]
  storedVisibleIds?: Set<string> | null
}): TableColumn[] => {
  const { initialColumns, prevColumns, storedVisibleIds } = params

  const prevVisibility = prevColumns ? new Map(prevColumns.map((c) => [c.id, c.visible])) : null

  return initialColumns.map((column) => {
    const visible =
      (prevVisibility?.has(column.id) ? prevVisibility.get(column.id) : undefined) ??
      (storedVisibleIds ? storedVisibleIds.has(column.id)! : undefined) ??
      column.visible !== false

    return { ...column, visible }
  })
}

const useTableProvider = ({
  data = [],
  error = null,
  isLoading = false,
  isFetching = false,
  isPlaceholderData = false,
  initialColumns,
}: Omit<TableProviderProps, 'children'>) => {
  const [selectedRows, setSelectedRows] = useState<SelectedRow[]>([])
  const [columns, setColumnsState] = useState<TableColumn[]>(() => {
    const storedVisibleIds = getStoredVisibleIds()
    return computeColumns({ initialColumns, storedVisibleIds })
  })

  // Sync stored columns when the source definitions (e.g., translations) change while keeping visibility.
  useEffect(() => {
    setColumnsState((prev) => computeColumns({ initialColumns, prevColumns: prev }))
  }, [initialColumns])

  const setColumns = (updatedColumns: TableColumn[]) => {
    const visibleIds = updatedColumns.filter((column) => column.visible).map((column) => column.id)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleIds))
    } catch (e) {
      console.warn('Error saving column visibility to localStorage:', e)
    }
    setColumnsState(updatedColumns)
  }

  const isSelected = (id: string) => selectedRows.some((row) => row.id === id)

  const allVisibleSelected = data.length && data.every((item) => isSelected(item.id))
  const someSelected = selectedRows.length > 0 && !allVisibleSelected

  const toggleAll = (checked: boolean) => {
    if (checked) {
      const newSelections = data
        .filter((item) => !isSelected(item.id))
        .map(({ id, name, surname }) => ({ id, name, surname }))
      setSelectedRows((prev) => [...prev, ...newSelections])
    } else {
      const visibleIds = new Set(data.map((item) => item.id))
      setSelectedRows((prev) => prev.filter((row) => !visibleIds.has(row.id)))
    }
  }

  const toggleOne = (id: string, checked: boolean) => {
    if (checked) {
      const item = data.find((i) => i.id === id)
      if (item) {
        setSelectedRows((prev) => [...prev, { id: item.id, name: item.name, surname: item.surname }])
      }
    } else {
      setSelectedRows((prev) => prev.filter((row) => row.id !== id))
    }
  }

  const resetSelectedRows = () => setSelectedRows([])

  return {
    data,
    error,
    isLoading,
    isFetching,
    isPlaceholderData,
    selectedRows,
    allVisibleSelected,
    someSelected,
    resetSelectedRows,
    isSelected,
    toggleAll,
    toggleOne,
    columns,
    setColumns,
  }
}

type TableContextType = ReturnType<typeof useTableProvider>

const TableContext = createContext<TableContextType>(undefined)

export const TableProvider = ({
  data = [],
  error = null,
  isLoading = false,
  isFetching = false,
  isPlaceholderData = false,
  initialColumns,
  children,
}: TableProviderProps) => {
  const value = useTableProvider({ data, error, isLoading, isFetching, isPlaceholderData, initialColumns })

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>
}

export const useTable = () => {
  const context = useContext(TableContext)
  if (!context) {
    throw new Error('useTable must be used within a TableProvider')
  }
  return context
}
