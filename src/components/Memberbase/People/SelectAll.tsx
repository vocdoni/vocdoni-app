import { Button, type ButtonProps, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isAbortError, MEMBERS_COLLECT_CAP, useMemberIdCollector } from '~src/queries/members'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { Separator } from './ContextBar'
import type { Selection } from './useSelection'

export type SelectAllState =
  | { status: 'idle' }
  /** More match than we load at once: say so before starting */
  | { status: 'confirm'; total: number }
  /** An import is adding people, so the matches would keep moving */
  | { status: 'blocked' }
  | { status: 'collecting' }
  /** Collected, but the number of matches moved meanwhile */
  | { status: 'changed'; selected: number; now: number }
  | { status: 'error' }

type UseSelectAllMatchingOptions = {
  search: string
  /** How many match the search (everyone, without one) */
  total: number
  selection: Selection
  /** A member import is running */
  importing: boolean
}

/**
 * "Select all N matching". Without a search it selects everyone without loading a single id
 * (actions take server paths). With one it pages the matching members into the selection, up to
 * 5,000, and checks the count again at the end.
 */
export const useSelectAllMatching = ({ search, total, selection, importing }: UseSelectAllMatchingOptions) => {
  const collector = useMemberIdCollector()
  const { collect, count, abort } = collector
  const [state, setState] = useState<SelectAllState>({ status: 'idle' })
  // The search everything matching was last selected for, so the bar stops offering it again
  const [doneFor, setDoneFor] = useState<{ search: string; capped: boolean } | null>(null)
  const { setMany, selectEveryone } = selection

  // Unticking anyone (or clearing) means not everything matching is selected anymore
  const lastCount = useRef(selection.count)
  useEffect(() => {
    if (selection.count < lastCount.current) setDoneFor(null)
    lastCount.current = selection.count
  }, [selection.count])

  // A new search is a new question
  useEffect(() => {
    abort()
    setState({ status: 'idle' })
    setDoneFor(null)
  }, [search, abort])

  const run = useCallback(async () => {
    setState({ status: 'collecting' })
    try {
      const result = await collect({ search, max: MEMBERS_COLLECT_CAP })
      setMany(result.members, true)
      setDoneFor({ search, capped: result.capped })
      trackAnalyticsEvent({
        name: AnalyticsEvents.MembersSelectAllMatching,
        props: { count: result.members.length, capped: result.capped },
      })
      const now = await count(search).catch(() => result.total)
      setState(now !== result.total ? { status: 'changed', selected: result.members.length, now } : { status: 'idle' })
    } catch (error) {
      setState(isAbortError(error) ? { status: 'idle' } : { status: 'error' })
    }
  }, [collect, count, search, setMany])

  const start = useCallback(() => {
    if (!search) {
      selectEveryone(total)
      trackAnalyticsEvent({ name: AnalyticsEvents.MembersSelectAllMatching, props: { count: total, capped: false } })
      return
    }
    if (importing) return setState({ status: 'blocked' })
    if (total > MEMBERS_COLLECT_CAP) return setState({ status: 'confirm', total })
    void run()
  }, [search, total, importing, selectEveryone, run])

  return {
    state,
    progress: collector.progress,
    /** Everything matching the current search is already selected (`capped`: the first 5,000) */
    done: doneFor?.search === search ? { capped: doneFor.capped } : null,
    start,
    confirm: run,
    stop: abort,
    dismiss: useCallback(() => setState({ status: 'idle' }), []),
  }
}

export type SelectAllMatching = ReturnType<typeof useSelectAllMatching>

export const LinkButton = (props: ButtonProps) => (
  <Button size='xs' variant='plain' px={0} h='auto' color='fg.info' flexShrink={0} {...props} />
)

/**
 * What the context bar says while selecting everything matching: the 5,000 cap before starting,
 * progress, or what happened. Null when there's nothing to say.
 */
export const SelectAllMessage = ({ selectAll }: { selectAll: SelectAllMatching }) => {
  const { t, i18n } = useTranslation()
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)
  const { state, progress } = selectAll

  switch (state.status) {
    case 'collecting':
      return (
        <>
          <Text fontSize='sm' fontVariantNumeric='tabular-nums' truncate role='status'>
            {progress?.total
              ? t('members.select_all.collecting', {
                  defaultValue: 'Collecting {{collected}} of {{total}}…',
                  collected: format(progress.collected),
                  total: format(progress.total),
                })
              : t('members.select_all.collecting_start', { defaultValue: 'Collecting the matching members…' })}
          </Text>
          <Separator />
          <LinkButton onClick={selectAll.stop}>{t('members.select_all.stop', { defaultValue: 'Stop' })}</LinkButton>
        </>
      )
    case 'confirm':
      return (
        <>
          <Text fontSize='sm' fontVariantNumeric='tabular-nums' truncate flexShrink={1} minW={0}>
            {t('members.select_all.cap', {
              defaultValue: 'Select the first {{cap}} of {{total}} matching — narrow your search to act on all',
              cap: format(MEMBERS_COLLECT_CAP),
              total: format(state.total),
            })}
          </Text>
          <LinkButton onClick={selectAll.confirm}>
            {t('members.select_all.cap_confirm', { defaultValue: 'Select {{cap}}', cap: format(MEMBERS_COLLECT_CAP) })}
          </LinkButton>
          <Separator />
          <LinkButton color='fg.muted' onClick={selectAll.dismiss}>
            {t('members.select_all.cancel', { defaultValue: 'Cancel' })}
          </LinkButton>
        </>
      )
    case 'blocked':
      return (
        <>
          <Text fontSize='sm' truncate role='status'>
            {t('members.select_all.importing', {
              defaultValue: 'An import is still adding people. Select everyone matching once it finishes.',
            })}
          </Text>
          <LinkButton onClick={selectAll.dismiss}>{t('members.select_all.ok', { defaultValue: 'OK' })}</LinkButton>
        </>
      )
    case 'changed':
      return (
        <>
          <Text fontSize='sm' fontVariantNumeric='tabular-nums' truncate role='status'>
            {t('members.select_all.changed', {
              defaultValue: 'Selected {{selected}}, but the list changed meanwhile: {{now}} match now.',
              selected: format(state.selected),
              now: format(state.now),
            })}
          </Text>
          <LinkButton onClick={selectAll.dismiss}>{t('members.select_all.ok', { defaultValue: 'OK' })}</LinkButton>
        </>
      )
    case 'error':
      return (
        <>
          <Text fontSize='sm' color='fg.error' truncate role='status'>
            {t('members.select_all.error', { defaultValue: "We couldn't select everyone matching." })}
          </Text>
          <LinkButton onClick={selectAll.start}>
            {t('members.select_all.retry', { defaultValue: 'Try again' })}
          </LinkButton>
        </>
      )
    default:
      return null
  }
}

type SelectAllOfferProps = {
  /** How many match the search, or everyone without one */
  total: number
  searching: boolean
  selectAll: SelectAllMatching
}

/** After "All 25 on this page selected": "Select all 1,742", or that they already are. */
export const SelectAllOffer = ({ total, searching, selectAll }: SelectAllOfferProps) => {
  const { t, i18n } = useTranslation()
  const formattedCount = total.toLocaleString(i18n.resolvedLanguage)

  if (selectAll.done)
    return (
      <>
        <Separator />
        <Text fontSize='sm' color='fg.muted' fontVariantNumeric='tabular-nums' truncate>
          {selectAll.done.capped
            ? t('members.select_all.done_capped', {
                defaultValue: 'The first {{cap}} matching selected',
                cap: MEMBERS_COLLECT_CAP.toLocaleString(i18n.resolvedLanguage),
              })
            : t('members.select_all.done', {
                defaultValue_one: 'The only match is selected',
                defaultValue_other: 'All {{formattedCount}} matching selected',
                count: total,
                formattedCount,
              })}
        </Text>
      </>
    )

  return (
    <>
      <Separator />
      <LinkButton fontVariantNumeric='tabular-nums' onClick={selectAll.start}>
        {searching
          ? t('members.select_all.offer_matching', {
              defaultValue_one: 'Select the only match',
              defaultValue_other: 'Select all {{formattedCount}} matching',
              count: total,
              formattedCount,
            })
          : t('members.select_all.offer', {
              defaultValue_one: 'Select your only member',
              defaultValue_other: 'Select all {{formattedCount}}',
              count: total,
              formattedCount,
            })}
      </LinkButton>
    </>
  )
}

/** "All 1,742 members selected · Clear selection", while everyone is selected. */
export const EveryoneSelectedMessage = ({ total, onClear }: { total: number; onClear: () => void }) => {
  const { t, i18n } = useTranslation()

  return (
    <>
      <Text fontSize='sm' fontVariantNumeric='tabular-nums' truncate>
        {t('members.select_all.everyone', {
          defaultValue_one: 'Your only member is selected',
          defaultValue_other: 'All {{formattedCount}} members selected',
          count: total,
          formattedCount: total.toLocaleString(i18n.resolvedLanguage),
        })}
      </Text>
      <Separator />
      <LinkButton onClick={onClear}>{t('members.select_all.clear', { defaultValue: 'Clear selection' })}</LinkButton>
    </>
  )
}
