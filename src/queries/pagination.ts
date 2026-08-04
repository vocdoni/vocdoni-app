/** Paginated SaaS REST response envelope (replaces the legacy SDK's `PaginationResponse`). */
export type PaginationResponse = {
  pagination: {
    totalItems: number
    previousPage: number | null
    currentPage: number
    nextPage: number | null
    lastPage: number
  }
}
