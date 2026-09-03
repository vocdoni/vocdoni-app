type KnownPaginationParams = {
  page?: number
  limit?: number
  status?: string
}

export const getPaginationParams = (searchParams: URLSearchParams): KnownPaginationParams => {
  const result: KnownPaginationParams = {}

  // Handle known pagination parameters
  if (searchParams.has('page')) result.page = Number(searchParams.get('page'))
  if (searchParams.has('limit')) result.limit = Number(searchParams.get('limit'))
  if (searchParams.has('status')) result.status = searchParams.get('status')?.toUpperCase()

  return result
}
