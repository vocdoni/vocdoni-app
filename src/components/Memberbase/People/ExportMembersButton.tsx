import { Button, Icon } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuDownload } from 'react-icons/lu'
import { useToast } from '~components/Toast'
import { collectMembers, isAbortError, useMembersPageFetcher } from '~src/queries/members'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { csvBlob, downloadBlob } from '~utils/download'
import { censusCsvRows, censusFileName } from '../Censuses/exportCsv'
import { type MemberFieldId, useMemberFields } from '../fields'

/**
 * Every member as a CSV, as the census exports are: phones left out, national IDs masked. Lives in
 * the Members header now that Everyone isn't listed among the censuses.
 */
export const ExportMembersButton = () => {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const fields = useMemberFields()
  const fetchPage = useMembersPageFetcher()
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const controller = useRef<AbortController | null>(null)
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)

  useEffect(() => () => controller.current?.abort(), [])

  const download = async () => {
    controller.current?.abort()
    const current = new AbortController()
    controller.current = current
    setProgress({ done: 0, total: 0 })
    try {
      const { members } = await collectMembers(fetchPage, {
        signal: current.signal,
        onProgress: ({ collected, total }) => setProgress({ done: collected, total }),
      })
      const headers = Object.fromEntries(fields.map((field) => [field.id, field.label])) as Record<
        MemberFieldId,
        string
      >
      const name = t('memberbase.export.file_name', { defaultValue: 'members' })
      downloadBlob(csvBlob(censusCsvRows(members, headers)), censusFileName(name).replace(/^census-/, ''))
      trackAnalyticsEvent({ name: AnalyticsEvents.CensusExported, props: { kind: 'everyone', count: members.length } })
    } catch (error) {
      if (isAbortError(error)) return
      toast({
        title: t('memberbase.export.error', { defaultValue: "Your members couldn't be downloaded" }),
        description: error instanceof Error ? error.message : undefined,
        type: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      if (controller.current === current) controller.current = null
      setProgress(null)
    }
  }

  return (
    <Button
      variant='outline'
      onClick={download}
      loading={progress !== null}
      loadingText={
        progress?.total
          ? t('memberbase.export.progress', {
              defaultValue: '{{done}} of {{total}}…',
              done: format(progress.done),
              total: format(progress.total),
            })
          : undefined
      }
    >
      <Icon as={LuDownload} />
      {t('memberbase.export.button', { defaultValue: 'Export' })}
    </Button>
  )
}
