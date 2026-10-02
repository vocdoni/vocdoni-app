import { Box, Button, Flex, Grid, Heading, Icon, Stack, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ErrorCode, type FileRejection, useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import { LuCalendar, LuDownload, LuFileSpreadsheet, LuLock } from 'react-icons/lu'
import { BookerModalButton } from '~components/Dashboard/Booker'
import Uploader from '~components/Layout/Uploader'
import ErrorMissingData from '~components/Spreadsheet/errors/ErrorMissingData'
import ErrorMissingHeader from '~components/Spreadsheet/errors/ErrorMissingHeader'
import { readTable, SPREADSHEET_ACCEPT, type Table } from '~components/Spreadsheet/readTable'
import { SectionCard } from '~components/ui/SectionCard'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { downloadBlob } from '~utils/download'
import { useMemberFields } from '../fields'
import { isKnownHeader } from './autoMatch'
import { TEMPLATE_FILE_NAMES, templateBlob, type TemplateFormat, templateRows } from './template'

/** Above this many people, a call with our team is offered */
export const LARGE_FILE_ROWS = 2000

// The files the call was offered for
const offered = new WeakSet<Table>()

/** Downloads the member template in the admin's language. */
export const useDownloadTemplate = (surface: 'import' | 'first_run') => {
  const fields = useMemberFields()
  return useCallback(
    (format: TemplateFormat) => {
      downloadBlob(templateBlob(format, templateRows(fields)), TEMPLATE_FILE_NAMES[format])
      trackAnalyticsEvent({ name: AnalyticsEvents.MembersTemplateDownloaded, props: { format, surface } })
    },
    [fields, surface]
  )
}

/** "Your file is read in your browser…", under the dropzone and on the first-run screen. */
export const PrivacyNote = () => {
  const { t } = useTranslation()
  // TODO(legal): EU storage and the data processing agreement are claimed only once legal confirms the
  // wording; see "Import wizard > Upload > Privacy strip" in the Members redesign plan.
  return (
    <Flex align='center' gap={2} fontSize='sm' color='fg.muted' bg='bg.muted' borderRadius='md' px={3} py={2}>
      <Icon as={LuLock} aria-hidden flexShrink={0} />
      <Text>
        {t('members.first_run.privacy', {
          defaultValue: 'Your file is read in your browser. Only the columns you keep are sent.',
        })}
      </Text>
    </Flex>
  )
}

type UploadStepProps = {
  table?: Table
  onTable: (table: Table) => void
  onContinue: () => void
}

export const UploadStep = ({ table, onTable, onContinue }: UploadStepProps) => {
  const { t, i18n } = useTranslation()
  const [error, setError] = useState<string>()
  const [reading, setReading] = useState(false)
  const downloadTemplate = useDownloadTemplate('import')
  // A slow read of an earlier drop must not replace a newer one, nor write after the page is left
  const latestDrop = useRef(0)
  useEffect(
    () => () => {
      latestDrop.current++
    },
    []
  )

  const untitledColumn = useCallback(
    (letter: string) => t('members.import.upload.untitled_column', { letter, defaultValue: 'Column {{letter}}' }),
    [t]
  )

  const onDrop = useCallback(
    async (accepted: File[], rejections: FileRejection[]) => {
      const [file] = accepted
      if (!file && !rejections.length) return
      const drop = ++latestDrop.current
      setError(undefined)
      if (rejections.length || accepted.length > 1) {
        const tooMany =
          accepted.length > 0 ||
          rejections.some(({ errors }) => errors.some(({ code }) => code === ErrorCode.TooManyFiles))
        setReading(false)
        setError(
          tooMany
            ? t('members.import.upload.too_many_files', { defaultValue: 'Upload one file at a time.' })
            : t('members.import.upload.invalid_type', {
                defaultValue: 'We can’t read this type of file. Upload an .xlsx, .xls, .csv or .ods file.',
              })
        )
        return
      }
      setReading(true)
      try {
        const next = await readTable(file, { isKnownHeader, untitledColumn })
        if (drop !== latestDrop.current) return
        onTable(next)
      } catch (e) {
        if (drop !== latestDrop.current) return
        console.error('could not read the member file:', e)
        if (e instanceof ErrorMissingData)
          setError(
            t('members.import.upload.no_rows', {
              defaultValue: 'We found the column names but nobody under them. Check the file and try again.',
            })
          )
        else if (e instanceof ErrorMissingHeader)
          setError(t('members.import.upload.empty', { defaultValue: 'This file looks empty.' }))
        else
          setError(
            t('members.import.upload.read_failed', {
              defaultValue: 'We couldn’t read this file. Check that it’s a spreadsheet or a CSV and try again.',
            })
          )
      } finally {
        if (drop === latestDrop.current) setReading(false)
      }
    },
    [onTable, t, untitledColumn]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: SPREADSHEET_ACCEPT,
  })

  const large = Boolean(table && table.rows.length > LARGE_FILE_ROWS)
  useEffect(() => {
    // Once per file: coming back to this step shows the offer again without counting it again
    if (!large || !table || offered.has(table)) return
    offered.add(table)
    trackAnalyticsEvent({ name: AnalyticsEvents.HelpOffered, props: { trigger: 'large_file' } })
  }, [large, table])

  const rows = table?.rows.length ?? 0

  return (
    <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 3fr) minmax(0, 2fr)' }} gap={6} alignItems='start'>
      <Stack gap={4}>
        <Box>
          <Uploader
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            isLoading={reading}
            formats={['XLSX', 'XLS', 'CSV', 'ODS']}
          />
          {error && (
            <Text role='alert' color='fg.error' fontSize='sm' mt={2}>
              {error}
            </Text>
          )}
        </Box>

        {table && !reading && (
          <SectionCard>
            <Flex align='center' gap={3} wrap='wrap'>
              <Icon as={LuFileSpreadsheet} boxSize={5} color='fg.muted' aria-hidden />
              <Box flex='1' minW={0}>
                <Text fontWeight='bolder' truncate>
                  {table.fileName}
                </Text>
                <Text fontSize='sm' color='fg.muted' fontVariantNumeric='tabular-nums'>
                  {t('members.import.upload.summary', {
                    count: rows,
                    formattedCount: rows.toLocaleString(i18n.resolvedLanguage),
                    columns: table.header.length,
                    defaultValue_one: '{{formattedCount}} person · {{columns}} columns',
                    defaultValue_other: '{{formattedCount}} people · {{columns}} columns',
                  })}
                </Text>
              </Box>
              <Button onClick={onContinue}>{t('members.import.continue', { defaultValue: 'Continue' })}</Button>
            </Flex>
          </SectionCard>
        )}

        {large && (
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ md: 'center' }}
            gap={3}
            p={4}
            borderRadius='md'
            borderWidth='1px'
            borderColor='border'
          >
            <Text flex='1' fontSize='sm'>
              {t('members.import.upload.large_file', {
                defaultValue: 'Big file? We can import it with you on a 20-min call.',
              })}
            </Text>
            <BookerModalButton
              trigger={
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => trackAnalyticsEvent({ name: AnalyticsEvents.HelpOpened, props: { channel: 'call' } })}
                >
                  <Icon as={LuCalendar} />
                  {t('members.import.upload.book_call', { defaultValue: 'Book a call' })}
                </Button>
              }
            />
          </Flex>
        )}

        <PrivacyNote />
      </Stack>

      <SectionCard>
        <Heading as='h2' fontSize='md' fontWeight='bolder' mb={2}>
          {t('members.import.upload.need_title', { defaultValue: 'What we need' })}
        </Heading>
        <Text fontSize='sm' mb={2}>
          {t('members.import.upload.need_basic', { defaultValue: 'A name and an email or mobile.' })}
        </Text>
        <Text fontSize='sm' color='fg.muted' mb={4}>
          {t('members.import.upload.need_extra', {
            defaultValue: 'Member number, national ID and birth date only if you’ll use them to sign in.',
          })}
        </Text>
        <Text fontSize='sm' fontWeight='bolder' mb={2}>
          {t('members.import.upload.template', { defaultValue: 'Download the template' })}
        </Text>
        <Flex gap={2} wrap='wrap'>
          <Button size='sm' variant='outline' onClick={() => downloadTemplate('xlsx')}>
            <Icon as={LuDownload} />
            {t('members.import.upload.template_xlsx', { defaultValue: 'Excel (.xlsx)' })}
          </Button>
          <Button size='sm' variant='outline' onClick={() => downloadTemplate('csv')}>
            <Icon as={LuDownload} />
            {t('members.import.upload.template_csv', { defaultValue: 'CSV (.csv)' })}
          </Button>
        </Flex>
      </SectionCard>
    </Grid>
  )
}
