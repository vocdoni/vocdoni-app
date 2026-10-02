import { useEffect, useMemo } from 'react'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { useAllGroups } from '~src/queries/groups'
import { flattenPages, useDraftProcesses, usePublishedProcesses } from '~src/queries/processes'
import { useVoteGroupMarkers } from '~src/queries/voteGroups'
import { buildCensusIndex } from './model'

/**
 * Everything the Censuses tab lists: Everyone, every vote's census (all pages of votes, published
 * and drafts) and the saved censuses, with the votes each one is used by.
 */
export const useCensusIndex = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const language = usePublicLanguage()
  const groups = useAllGroups({ enabled })
  const published = usePublishedProcesses()
  const drafts = useDraftProcesses()
  const { markers, ready: markersReady } = useVoteGroupMarkers()

  // The index needs every vote, not the first hundred: keep loading while there are more
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = published
  useEffect(() => {
    if (enabled && hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [enabled, hasNextPage, isFetchingNextPage, fetchNextPage])

  const draftPages = drafts.data?.pages
  const { hasNextPage: moreDrafts, isFetchingNextPage: fetchingDrafts, fetchNextPage: nextDrafts } = drafts
  useEffect(() => {
    if (enabled && moreDrafts && !fetchingDrafts) nextDrafts()
  }, [enabled, moreDrafts, fetchingDrafts, nextDrafts])

  const index = useMemo(
    () =>
      buildCensusIndex({
        groups: groups.data ?? [],
        published: flattenPages(published.data?.pages),
        // A viewer can't list drafts: they're left out rather than failing the page
        drafts: flattenPages(draftPages),
        markers,
        language,
      }),
    [groups.data, published.data, draftPages, markers, language]
  )

  return {
    index,
    isLoading: groups.isLoading || published.isLoading || !markersReady,
    isError: groups.isError || published.isError,
    error: groups.error ?? published.error,
    markers,
  }
}
