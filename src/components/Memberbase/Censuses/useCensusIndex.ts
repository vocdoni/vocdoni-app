import { useEffect, useMemo } from 'react'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { useAllGroups } from '~src/queries/groups'
import { flattenPages, useDraftProcesses, usePublishedProcesses } from '~src/queries/processes'
import { useVoteGroupMarkers } from '~src/queries/voteGroups'
import { buildCensusIndex } from './model'

/**
 * Every vote of the organization, published and drafts, all pages of them (the census pages need
 * them all, not the first hundred). A viewer can't list drafts: they're left out rather than failing.
 */
export const useAllVotes = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const published = usePublishedProcesses()
  const drafts = useDraftProcesses()

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = published
  useEffect(() => {
    if (enabled && hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [enabled, hasNextPage, isFetchingNextPage, fetchNextPage])

  const { hasNextPage: moreDrafts, isFetchingNextPage: fetchingDrafts, fetchNextPage: nextDrafts } = drafts
  useEffect(() => {
    if (enabled && moreDrafts && !fetchingDrafts) nextDrafts()
  }, [enabled, moreDrafts, fetchingDrafts, nextDrafts])

  const publishedList = useMemo(() => flattenPages(published.data?.pages), [published.data])
  const draftList = useMemo(() => flattenPages(drafts.data?.pages), [drafts.data])
  const all = useMemo(() => [...publishedList, ...draftList], [publishedList, draftList])

  // Every page of both lists is in, with no failed page: only then is "no vote uses it" known
  const complete =
    !!published.data &&
    !!drafts.data &&
    !published.hasNextPage &&
    !drafts.hasNextPage &&
    !published.isError &&
    !drafts.isError

  return {
    published: publishedList,
    drafts: draftList,
    all,
    complete,
    isLoading: published.isLoading,
    isError: published.isError,
    error: published.error,
  }
}

/**
 * Everything the Censuses tab lists: Everyone, every vote's census and the saved censuses, with the
 * votes each one is used by.
 */
export const useCensusIndex = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const language = usePublicLanguage()
  const groups = useAllGroups({ enabled })
  const votes = useAllVotes({ enabled })
  const { markers, ready: markersReady } = useVoteGroupMarkers()

  const index = useMemo(
    () =>
      buildCensusIndex({
        groups: groups.data ?? [],
        published: votes.published,
        drafts: votes.drafts,
        markers,
        language,
      }),
    [groups.data, votes.published, votes.drafts, markers, language]
  )

  return {
    index,
    isLoading: groups.isLoading || votes.isLoading || !markersReady,
    isError: groups.isError || votes.isError,
    error: groups.error ?? votes.error,
    markers,
  }
}
