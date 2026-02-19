import { FieldRoot as FormControl, FieldErrorText as FormErrorMessage, Link, Text } from '@chakra-ui/react'
import { useCallback, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { useSubscription } from '~components/Auth/Subscription'
import Uploader from '~components/Layout/Uploader'
import { CsvGenerator } from '~components/Spreadsheet/generator'
import { enforceCsvRowLimit } from '~components/Spreadsheet/limits'
import { CsvPreview } from '~components/Spreadsheet/Preview'
import { CensusTypes } from '../CensusType'
import { CensusSpreadsheetManager } from './CensusSpreadsheetManager'

export const CensusCsvManager = () => {
  const { t } = useTranslation()
  const {
    register,
    setValue,
    watch,
    setError,
    formState: { errors },
    control,
  } = useFormContext()
  const weighted: boolean = watch('weightedVote')
  const manager: CensusSpreadsheetManager | undefined = watch('spreadsheet')
  const censusType = watch('censusType')
  const { subscription } = useSubscription()
  const maxCensusSize = subscription?.subscriptionDetails?.maxCensusSize || subscription?.plan?.organization?.maxCensus

  // File dropzone
  const onDrop = useCallback(
    async ([file]: File[]) => {
      setValue('spreadsheet', undefined)
      setError('spreadsheet', {})
      try {
        const spreadsheet = new CensusSpreadsheetManager(file, true, weighted)
        await spreadsheet.read()
        enforceCsvRowLimit({
          rowCount: spreadsheet.data.length,
          max: maxCensusSize,
          errorMessage: t('uploader.csv_row_limit_exceeded', {
            defaultValue: 'This import would result in {{count}} total rows, exceeding your plan limit of {{max}}.',
            count: spreadsheet.data.length,
            max: maxCensusSize ?? 0,
          }),
        })
        setValue('spreadsheet', spreadsheet)
      } catch (e) {
        if (e instanceof Error) {
          setError('spreadsheet', {
            type: e.name,
            message: e.message,
          })
        }
        console.error('could not load file:', e)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maxCensusSize, setError, setValue, t, weighted]
  )
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: CensusSpreadsheetManager.AcceptedTypes.reduce((prev, curr) => ({ ...prev, [curr]: [] }), {}),
  })
  const upload = getRootProps()

  // CSV templates
  const template = useMemo(() => {
    const header = [
      t('form.process_create.spreadsheet.template.firstname'),
      t('form.process_create.spreadsheet.template.lastname'),
      t('form.process_create.spreadsheet.template.email'),
    ]
    let rows = [
      ['John', 'Doe', 'john@doe.com'],
      ['Joline', 'Doe', 'joline@doe.com'],
    ]
    if (weighted) {
      header.unshift(t('form.process_create.spreadsheet.template.weight'))
      rows = rows.map((row, k) => [(k + 1).toString(), ...row])
    }

    return new CsvGenerator(header, rows)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weighted])

  return (
    <>
      <Text color='texts.subtle' fontSize='xs'>
        {t('form.process_create.spreadsheet.upload_description', {
          defaultValue:
            'Upload a CSV file with the participants. Each column will be used as a credential that the voter will have to use to authenticate. The first row will be the titles of that credential.',
        })}
      </Text>

      <FormControl
        {...register('spreadsheet', {
          required: { value: censusType === CensusTypes.Spreadsheet, message: t('form.error.field_is_required') },
        })}
        {...upload}
        invalid={!!errors?.spreadsheet}
        display={manager?.data?.length ? 'none' : 'block'}
      >
        <Uploader getInputProps={getInputProps} getRootProps={getRootProps} isDragActive={isDragActive} />{' '}
        <FormErrorMessage display='flex' justifyContent='center'>
          {errors?.spreadsheet?.message?.toString()}
        </FormErrorMessage>
      </FormControl>
      <Text fontSize='xs' color='texts.subtle'>
        <Trans
          i18nKey='form.process_create.spreadsheet.download_template'
          components={{
            a: <Link href={template.url} download='template.csv' />,
          }}
          defaults="You don't have a CSV file? <a>Download template.csv</a>, fill it and upload it."
        />
      </Text>
      <CsvPreview manager={manager} upload={upload} />
    </>
  )
}
