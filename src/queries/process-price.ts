import { useQuery } from '@tanstack/react-query'
import { isApiError } from '@vocdoni/api-client'
import type { ProcessPriceResponse } from '@vocdoni/api-types'
import { ErrorCode } from '~components/Auth/api'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { QueryKeys } from './keys'

// Process ids are MongoDB ObjectIDs. The id priced comes from the URL (?draftId=), and encoding it
// is not enough: "." and ".." survive encodeURIComponent and the URL would resolve them, pointing
// the request at another endpoint.
export const isProcessId = (id?: string | null): id is string => !!id && /^[0-9a-f]{24}$/i.test(id)

/**
 * The backend's own price of a draft, the only one the app may show before payment: it depends on
 * the census size, the 2FA channels and the add-ons stored with the draft. The census is rebuilt
 * from its group on every save, so the price is re-read after each one (see useUpdateProcess), and
 * when the window regains focus, since the group may have grown from another tab.
 *
 * A failed refetch keeps the last price in the query's `data`; `price` drops it, so a price the
 * backend no longer stands by is never shown, nor acted on. Read the query's own state through
 * `query`: it only re-renders the caller for the fields it reads.
 */
export const useProcessPrice = (processId?: string | null) => {
  const { client } = useApiClient()

  const query = useQuery<ProcessPriceResponse, Error>({
    queryKey: QueryKeys.process.price(processId ?? undefined),
    enabled: isProcessId(processId),
    queryFn: () => client.elections.getPrice(processId!),
    // Most failures are a draft the backend cannot price yet (isUnpriceableDraft): retrying them
    // only delays the hint
    retry: false,
    refetchOnWindowFocus: true,
  })

  return { price: query.isError ? undefined : query.data, query }
}

// The backend refuses to price a draft without voters (a census of size 0 fails its price formula),
// which drafts lack until their voters and authentication are set up.
export const isUnpriceableDraft = (error: unknown) => isApiError(error, ErrorCode.MalformedJSONBody)

// Above the self-service limit the zero total is not a free process: the backend refuses every
// publish of it, so the app offers no way to publish it.
export const isQuoteOnly = (price?: ProcessPriceResponse) => !!price?.quoteRequired
