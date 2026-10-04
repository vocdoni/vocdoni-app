import { Breadcrumb, Stack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { generatePath, Navigate, Link as RouterLink, useParams } from 'react-router'
import { Routes } from '~routes'
import { safeId } from '~utils/ids'
import { CensusDetail } from './CensusDetail'
import { untitledVote } from './labels'
import { type CensusDetailTarget, useResolvedCensus } from './useResolvedCensus'

/**
 * A census as a page of the Members section: the way back to the index, then the census with its own
 * header (name, purpose, actions). `/censuses/:groupId` of a vote's own group goes to that vote's census.
 */
export const CensusPage = ({ kind }: { kind: 'saved' | 'vote' }) => {
  const { t } = useTranslation()
  const params = useParams()
  const target: CensusDetailTarget =
    kind === 'vote' ? { kind, processId: safeId(params.processId) } : { kind, groupId: safeId(params.groupId) }
  const census = useResolvedCensus(target)

  // Everyone isn't a census of its own any more: its people are the People tab
  if (kind === 'saved' && census.kind === 'everyone')
    return <Navigate to={generatePath(Routes.dashboard.memberbase.members, { page: '1' })} replace />

  if (kind === 'saved' && census.marker)
    return (
      <Navigate
        to={generatePath(Routes.dashboard.memberbase.voteCensus, { processId: census.marker.processId })}
        replace
      />
    )

  const title = census.title || (kind === 'vote' && !census.isLoading ? untitledVote(t, census.state === 'draft') : '')

  return (
    <Stack gap={4}>
      <Breadcrumb.Root size='sm'>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link asChild>
              <RouterLink to={Routes.dashboard.memberbase.censuses}>
                {t('memberbase.censuses.title', { defaultValue: 'Censuses' })}
              </RouterLink>
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item minW={0}>
            <Breadcrumb.CurrentLink truncate>{title}</Breadcrumb.CurrentLink>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
      <CensusDetail {...target} />
    </Stack>
  )
}
