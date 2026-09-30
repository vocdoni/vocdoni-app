import {
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Flex,
  FieldRoot as FormControl,
  FieldErrorText as FormErrorMessage,
  Heading,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useCallback, useMemo, useState } from 'react'
import { FileRejection, useDropzone } from 'react-dropzone'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuFileSpreadsheet } from 'react-icons/lu'
import { useSubscription } from '~components/Auth/Subscription'
import { dropRejectionMessage, useLatestDrop } from '~components/Layout/dropzone'
import Uploader from '~components/Layout/Uploader'
import { usePricingModal } from '~components/Pricing/use-pricing-modal'
import { CsvGenerator } from '~components/Spreadsheet/generator'
import { CsvRowLimitExceededError, enforceCsvRowLimit } from '~components/Spreadsheet/limits'
import SpreadsheetError from '~components/Spreadsheet/errors/SpreadsheetError'
import { SpreadsheetManager } from '~components/Spreadsheet/SpreadsheetManager'
import { usePaginatedMembers } from '~queries/members'
import { useTable } from '../TableProvider'

const generateFakeValue = (columnId: string): string => {
  switch (columnId) {
    case 'name':
      return 'John'
    case 'surname':
      return 'Doe'
    case 'email':
      return 'john@doe.com'
    case 'phone':
      return '+1234567890'
    case 'memberID':
      return '123456'
    case 'nationalId':
      return '987654321'
    case 'birthDate':
      return '1990-01-01'
    default:
      return ''
  }
}

export const MembersCsvManager = () => {
  const { t } = useTranslation()
  const {
    register,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext()
  const { columns } = useTable()
  const { subscription } = useSubscription()
  const { openModal } = usePricingModal()
  const { data: membersData } = usePaginatedMembers({ showAll: true })
  const manager: SpreadsheetManager | undefined = watch('spreadsheet')
  const maxCensusSize = subscription?.subscriptionDetails?.maxCensusSize || subscription?.plan?.organization?.maxCensus
  const existingMembers = membersData?.pagination?.totalItems ?? 0

  // File dropzone
  // A slow read from an earlier drop can't overwrite the outcome of a newer one. The drawer also unmounts this
  // component on close while the form outlives it, so a read still in flight must not write its file (or open the
  // upgrade modal) after the user closed the drawer or reopened it and dropped another. `reading` is true while the
  // latest drop's file is read, so the dropzone shows it is busy
  const { busy: reading, start, isLatest, finish } = useLatestDrop()
  const onDrop = useCallback(
    async (accepted: File[], rejections: FileRejection[] = []) => {
      const [file] = accepted
      // Nothing was dropped at all (e.g. an empty folder), so there is nothing to complain about. Bail out before
      // starting a drop, or an empty drop would silently discard a read that is still in flight
      if (!file && !rejections.length) return
      // react-dropzone calls onDrop even when every file was rejected, so there may be nothing to read
      const rejected = dropRejectionMessage(
        t,
        accepted,
        rejections,
        t('memberbase.importer.error.invalid_file_type', {
          defaultValue: "This file type isn't supported. Upload a .csv, .xlsx, .xls or .ods file.",
        })
      )
      const drop = start(!rejected)
      setValue('spreadsheet', undefined)
      clearErrors('spreadsheet')
      if (rejected) {
        setError('spreadsheet', { type: 'validate', message: rejected })
        return
      }
      try {
        const spreadsheet = new SpreadsheetManager(file, true)
        await spreadsheet.read()
        if (!isLatest(drop)) return
        const totalMembers = spreadsheet.data.length + existingMembers
        const limitErrorMessage = t('uploader.csv_row_limit_exceeded', {
          count: totalMembers,
          max: maxCensusSize ?? 0,
        })
        enforceCsvRowLimit({
          rowCount: spreadsheet.data.length,
          baseCount: existingMembers,
          max: maxCensusSize,
          errorMessage: limitErrorMessage,
        })
        setValue('spreadsheet', spreadsheet)
      } catch (e) {
        if (!isLatest(drop)) return
        if (e instanceof CsvRowLimitExceededError) {
          openModal('planUpgrade', { context: 'memberbase', limit: String(maxCensusSize ?? '') })
          return
        }
        // Only our own errors carry a translated message; anything else (FileReader, xlsx) is raw browser text
        const known = e instanceof SpreadsheetError
        setError('spreadsheet', {
          type: known ? e.name : 'validate',
          message: known
            ? e.message
            : t('memberbase.importer.error.read_failed', {
                defaultValue: "We couldn't read this file. Check that it's a valid CSV or spreadsheet and try again.",
              }),
        })
        console.error('could not load file:', e)
      } finally {
        finish(drop)
      }
    },
    [clearErrors, existingMembers, finish, isLatest, maxCensusSize, openModal, setError, setValue, start, t]
  )
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: SpreadsheetManager.Accept,
  })
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['name', 'surname', 'email'])
  const handleColumnChange = (value: string[]) => setVisibleColumns(value)
  const template = useMemo(() => {
    const header = columns.filter((column) => visibleColumns.includes(column.id)).map((column) => column.label)
    const rows = columns
      .filter((column) => visibleColumns.includes(column.id))
      .map((column) => generateFakeValue(column.id))

    return new CsvGenerator(header, [rows])
  }, [visibleColumns])

  return (
    <Flex flexDirection='column' gap={4}>
      <Card.Root>
        <Card.Body display='flex' flexDirection='column' gap={2}>
          <Text>
            {t('memberbase.importer.included_columns', {
              defaultValue: 'Select columns to include:',
            })}
          </Text>
          <CheckboxGroup value={visibleColumns} onValueChange={handleColumnChange}>
            {columns.map((column) => (
              <Checkbox.Root key={column.id} value={column.id}>
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label>{column.label}</Checkbox.Label>
              </Checkbox.Root>
            ))}
          </CheckboxGroup>
        </Card.Body>
        <Card.Footer display='flex' flexDirection='column' gap={2}>
          <Button asChild variant='outline' disabled={!visibleColumns.length} w='100%'>
            <Link
              href={template.url}
              aria-disabled={!visibleColumns.length}
              pointerEvents={visibleColumns.length ? 'auto' : 'none'}
              variant='button'
            >
              <LuFileSpreadsheet />
              {t('memberbase.importer.download_template_btn', {
                defaultValue: 'Download Template',
              })}
            </Link>
          </Button>
          {!visibleColumns.length && (
            <Text fontSize='sm' color='fg.muted' mt={1}>
              {t('memberbase.importer.select_at_least_one_column', {
                defaultValue: 'Select at least one column to download the template.',
              })}
            </Text>
          )}
        </Card.Footer>
      </Card.Root>

      <FormControl
        {...register('spreadsheet', {
          required: { value: true, message: t('form.error.field_is_required') },
        })}
        invalid={!!errors?.spreadsheet}
        display={manager?.data.length ? 'none' : 'block'}
      >
        <Stack gap={4}>
          <Heading size='md' fontWeight='extrabold'>
            {t('memberbase.import_file.title', { defaultValue: 'Import File' })}
          </Heading>
          <Text color='texts.subtle' fontSize='sm'>
            {t('memberbase.import_file.subtitle', {
              defaultValue:
                'Import your CSV, XLS, XLSX, or ODS file containing member data. Ensure column headers match the template for accurate mapping.',
            })}
          </Text>
          <Uploader
            getInputProps={getInputProps}
            getRootProps={getRootProps}
            isDragActive={isDragActive}
            isLoading={reading}
          />
          <FormErrorMessage display='flex' justifyContent='center'>
            {errors?.spreadsheet?.message?.toString()}
          </FormErrorMessage>
        </Stack>
      </FormControl>
    </Flex>
  )
}
