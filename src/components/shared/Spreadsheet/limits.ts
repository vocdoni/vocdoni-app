type CsvRowLimitOptions = {
  rowCount: number
  baseCount?: number
  max?: number | null
  errorMessage: string
}

export class CsvRowLimitExceededError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CsvRowLimitExceededError'
  }
}

export const enforceCsvRowLimit = ({ rowCount, baseCount = 0, max, errorMessage }: CsvRowLimitOptions) => {
  const totalCount = rowCount + baseCount
  if (typeof max === 'number' && max > 0 && totalCount > max) {
    throw new CsvRowLimitExceededError(errorMessage)
  }
}
