import type { TFunction } from 'i18next'
import type { VoteGroupSource } from '~src/queries/voteGroups'
import type { CensusSource } from './model'

/** Where a copy came from when its source can't be named (deleted since, or not loaded). */
export const copiedFromUnnamed = (t: TFunction, source?: VoteGroupSource) => {
  switch (source) {
    case 'saved':
      return t('censuses.source.copy_saved', { defaultValue: 'Copied from a saved census' })
    case 'previous':
      return t('censuses.source.copy_previous', { defaultValue: 'Copied from another vote' })
    case 'everyone':
      return t('censuses.source.copy_everyone', { defaultValue: 'Copied from Everyone' })
    default:
      return t('censuses.source.chosen', { defaultValue: 'Chosen by hand' })
  }
}

/**
 * Where a vote's voters come from, in a few words for its row. `day` formats a date ("30 Sep") for the
 * copy of every member, so it says when that copy was made.
 */
export const censusSourceLabel = (t: TFunction, source: CensusSource, day?: (iso: string) => string) => {
  switch (source.kind) {
    case 'everyone':
      return t('censuses.source.everyone', { defaultValue: 'Everyone' })
    case 'copy':
      if (source.from)
        return t('censuses.source.copy_from', { defaultValue: "Copied from '{{name}}'", name: source.from })
      return copiedFromUnnamed(t, source.source)
    case 'snapshot':
      return source.madeAt && day
        ? t('censuses.source.snapshot_on', {
            defaultValue: 'Copy of all your members on {{date}}',
            date: day(source.madeAt),
          })
        : t('censuses.source.snapshot', { defaultValue: 'Copy of all your members when you published' })
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
