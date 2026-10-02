import type { TFunction } from 'i18next'
import type { CensusSource } from './model'

/** Where a vote's voters come from, in a few words for its row. */
export const censusSourceLabel = (t: TFunction, source: CensusSource) => {
  switch (source.kind) {
    case 'everyone':
      return t('censuses.source.everyone', { defaultValue: 'Everyone' })
    case 'copy':
      return source.from
        ? t('censuses.source.copy_from', { defaultValue: "Copied from '{{name}}'", name: source.from })
        : t('censuses.source.copy', { defaultValue: 'Its own copy' })
    case 'snapshot':
      return t('censuses.source.snapshot', { defaultValue: 'Everyone, frozen at publish' })
    case 'test':
      return t('censuses.source.test', { defaultValue: 'Test vote' })
    case 'saved':
      return t('censuses.source.saved', { defaultValue: "Saved census '{{name}}'", name: source.group.title })
    case 'selected':
      return t('censuses.source.selected', { defaultValue: 'Selected people' })
  }
}

export const votersUnit = (t: TFunction, count: number) =>
  t('censuses.unit.voters', { count, defaultValue_one: 'voter', defaultValue_other: 'voters' })

export const peopleUnit = (t: TFunction, count: number) =>
  t('censuses.unit.people', { count, defaultValue_one: 'person', defaultValue_other: 'people' })

/** The name of Everyone, whatever the API calls the auto group. */
export const everyoneTitle = (t: TFunction) => t('censuses.everyone.title', { defaultValue: 'Everyone' })

export const untitledVote = (t: TFunction, draft = false) =>
  draft
    ? t('processes.list.untitled_draft', { defaultValue: 'Untitled draft' })
    : t('processes.list.untitled', { defaultValue: 'Untitled vote' })
