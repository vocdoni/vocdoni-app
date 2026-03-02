import {
  AlertRoot as Alert,
  AlertDescription,
  AlertTitle,
  Box,
  Button,
  CloseButton,
  Dialog,
  Drawer,
  Flex,
  FieldRoot as FormControl,
  FieldLabel as FormLabel,
  Heading,
  HStack,
  Icon,
  List,
  Progress,
  Stack,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHeader,
  TableRoot,
  TableRow,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-providers'
import { chakraComponents } from 'chakra-react-select'
import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuCheck, LuTriangleAlert, LuUpload } from 'react-icons/lu'
import { useOutletContext } from 'react-router-dom'
import { Select } from '~components/Form/Select'
import { SpreadsheetManager } from '~components/Spreadsheet/SpreadsheetManager'
import { useToast } from '~components/Toast'
import { QueryKeys } from '~src/queries/keys'
import { useAddMembers, useImportJobProgress } from '~src/queries/members'
import { MemberbaseTabsContext } from '..'
import { useTable } from '../TableProvider'
import { MembersCsvManager } from './MembersCsvManager'

type SpreadsheetRow = Record<string, string>
type ColumnMapping = Record<string, string>
type MappedRow = Record<string, string>

type FieldsMapperProps = {
  manager?: SpreadsheetManager
  columnMapping: ColumnMapping
  setColumnMapping: React.Dispatch<React.SetStateAction<ColumnMapping>>
}

type ImportDataPreviewProps = {
  columnMapping: ColumnMapping
  setColumnMapping: React.Dispatch<React.SetStateAction<ColumnMapping>>
}

const PROGRESS_INCREMENT = 5 // Maximum increment for fake progress
const PROGRESS_UPDATE_INTERVAL = 500 // Interval for fake progress updates

const mapSpreadsheetData = (data: SpreadsheetRow[], mapping: ColumnMapping): MappedRow[] => {
  return data.map((row) => {
    const mappedRow: MappedRow = {}

    for (const targetKey in mapping) {
      const sourceKey = mapping[targetKey]
      if (row[sourceKey] !== undefined) {
        mappedRow[targetKey] = row[sourceKey]
      }
    }

    return mappedRow
  })
}

const TemplateUploader = () => {
  const { t } = useTranslation()

  return (
    <Stack gap={4}>
      <Heading size='md' fontWeight='extrabold'>
        {t('memberbase.download_template.title', { defaultValue: 'Download Import Template' })}
      </Heading>
      <Text color='texts.subtle' fontSize='sm'>
        {t('memberbase.download_template.subtitle', {
          defaultValue:
            'Download the template with your chosen columns, add your member data, and upload the file to set up your memberbase. Once it’s ready, you can start creating votes.',
        })}
      </Text>
      <MembersCsvManager />
    </Stack>
  )
}

export const ImportProgress = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { organization } = useOrganization()
  const { jobId, setJobId } = useOutletContext<MemberbaseTabsContext>()
  const { data, isError } = useImportJobProgress()

  const [progress, setProgress] = useState(0)
  const isComplete = data?.progress === 100
  const hasErrors = data?.errors?.length > 0

  useEffect(() => {
    if (data?.progress === undefined || isComplete) return

    let interval: NodeJS.Timeout
    const current = data.progress
    const target = current + PROGRESS_INCREMENT

    interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1
        return next >= target ? target : next
      })
    }, PROGRESS_UPDATE_INTERVAL)

    setProgress(current)

    return () => clearInterval(interval)
  }, [data?.progress, isComplete])

  const { open: isErrorModalOpen, onOpen: onOpenErrors, onClose: onCloseErrors } = useDisclosure()

  useEffect(() => {
    if (isComplete) {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.organization.members(organization.address),
        exact: false,
      })
    }
  }, [data?.progress, queryClient, organization.address, isComplete])

  const closeAlert = () => setJobId(null)

  const getStatus = () => {
    if (isComplete && hasErrors) return 'warning'
    if (isComplete) return 'success'
    if (isError) return 'error'
    return 'info'
  }

  const ImportTitle = () => {
    if (isComplete && hasErrors)
      return <Trans i18nKey='import_progress.completed_with_errors' defaults='Import Completed with Errors' />
    if (isComplete)
      return <Trans i18nKey='import_progress.success_title' defaults='Your member data has been imported successfully.' />
    if (isError) return <Trans i18nKey='import_progress.error_title' defaults='Import Error' />

    return <Trans i18nKey='import_progress.title' defaults='Memberbase Import in Progress' />
  }

  const ImportDescription = () => {
    if (isComplete && hasErrors) {
      return (
        <>
          <Text>
            {t('import_progress.completed_with_errors_description', {
              defaultValue: 'Your data was imported with some errors.',
            })}
          </Text>
          <Button onClick={onOpenErrors} size='sm' mt={1} alignSelf='start'>
            {t('import_progress.view_errors', {
              defaultValue: `View {{count}} errors`,
              count: data.errors.length,
            })}
          </Button>
        </>
      )
    }

    if (isComplete) {
      return (
        <Text>
          {t('import_progress.success_description', {
            defaultValue: 'You may now start using your imported members.',
          })}
        </Text>
      )
    }

    if (isError) {
      return (
        <Text>
          {t('import_progress.error_description', {
            defaultValue: 'An error occurred while importing your member data. Please try again later.',
          })}
        </Text>
      )
    }

    return (
      <>
        <Progress.Root size='md' value={progress} borderRadius='md' animated striped>
          <Progress.Track borderRadius='md'>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
        <Text>
          {t('import_progress.description', {
            defaultValue:
              'Your member data has been imported, but some errors occurred, and because of that some users have missing fields.',
          })}
        </Text>
        <Text fontSize='sm'>
          {t('import_progress.note', {
            defaultValue: 'You can safely close this page. An email will be sent to you upon completion.',
          })}
        </Text>
      </>
    )
  }

  if (!jobId) return null

  return (
    <>
      <Alert
        status={getStatus()}
        borderRadius='md'
        mb={3}
        mt={4}
        p={6}
        as={Flex}
        flexDirection='row'
        justifyContent='space-between'
      >
        <Flex flexDirection='column' gap={2} flex={1}>
          <AlertTitle>
            <ImportTitle />
          </AlertTitle>
          <AlertDescription display='flex' flexDirection='column' gap={2}>
            <ImportDescription />
          </AlertDescription>
        </Flex>

        <CloseButton alignSelf='flex-start' position='relative' onClick={closeAlert} />
      </Alert>

      {/* Error modal */}
      <Dialog.Root
        size='xl'
        placement='center'
        open={isErrorModalOpen}
        onOpenChange={({ open }) => (open ? onOpenErrors() : onCloseErrors())}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
            <Dialog.Header>
              <Dialog.Title>
                {t('import_progress.error_modal_title', {
                  defaultValue: 'Import Errors',
                })}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <List.Root display='flex' flexDirection='column' gap={2} pl={4} listStyleType='disc'>
                {data?.errors?.map((error, i) => (
                  <List.Item key={i} whiteSpace='pre-wrap' fontSize='sm'>
                    {error}
                  </List.Item>
                ))}
              </List.Root>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant='ghost' onClick={onCloseErrors}>
                {t('close', { defaultValue: 'Close' })}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  )
}

const FieldsMapper = ({ manager, columnMapping, setColumnMapping }: FieldsMapperProps) => {
  const { t } = useTranslation()
  const { columns } = useTable()

  if (!manager || !manager.data) return null

  const headerOptions = [
    {
      label: t('memberbase.importer.field_mapper.empty', {
        defaultValue: '-- Do not import --',
      }),
      value: '',
    },
    ...manager.header.map((field) => ({
      label: field,
      value: field,
    })),
  ]

  const previewRows = manager.data.slice(0, 3)

  const getCellValue = (row: string[], fieldId: string) => {
    const columnName = columnMapping[fieldId]
    const columnIndex = manager.header.indexOf(columnName)
    return columnIndex !== -1 ? row[columnIndex] : '-'
  }

  const getAvailableOptions = (fieldId: string) => {
    const usedValues = Object.entries(columnMapping)
      .filter(([key, value]) => key !== fieldId && value)
      .map(([_, value]) => value)

    return headerOptions.filter((opt) => !usedValues.includes(opt.value))
  }

  return (
    <HStack flexDirection='column' gap={4} w='full' alignItems='flex-start'>
      <Box borderRadius='lg' borderColor='table.border' borderWidth='1px' p={4} w='full'>
        <Flex borderRadius='lg' borderColor='table.border' borderWidth='1px' p={4} gap={3} mb={2}>
          <Icon as={LuTriangleAlert} boxSize={4} color='texts.subtle' />
          <HStack flexDirection='column' gap={0} alignItems='flex-start'>
            <Heading size='sm' fontWeight='bold'>
              {t('memberbase.importer.warning.title', { defaultValue: 'Warning' })}
            </Heading>
            <Text fontSize='sm' color='texts.subtle'>
              {t('memberbase.importer.warning.subtitle', {
                defaultValue: 'The information of columns that are not mapped will not be imported.',
              })}
            </Text>
          </HStack>
        </Flex>
        <Flex flexDirection='column' gap={4}>
          {columns.map(({ id, label }) => (
            <FormControl key={id}>
              <Flex gap={3} align='center'>
                <FormLabel htmlFor={id} flex='1'>
                  {label}
                </FormLabel>
                <Box flex='1'>
                  <Select
                    id={id}
                    name={id}
                    options={getAvailableOptions(id)}
                    onChange={(selectedOption) =>
                      setColumnMapping((prev) => ({
                        ...prev,
                        [id]: selectedOption?.value || '',
                      }))
                    }
                    value={
                      columnMapping[id] === undefined
                        ? null
                        : (headerOptions.find((opt) => opt.value === columnMapping[id]) ?? null)
                    }
                    placeholder={t('memberbase.importer.field_mapper.placeholder', {
                      defaultValue: 'Select column',
                    })}
                    components={{
                      Option: (props) => {
                        const { isSelected, children } = props
                        return (
                          <chakraComponents.Option {...props}>
                            <Flex align='center' gap={2}>
                              {isSelected && <Icon as={LuCheck} boxSize={4} color='texts.subtle' />}
                              {children}
                            </Flex>
                          </chakraComponents.Option>
                        )
                      },
                    }}
                  />
                </Box>
              </Flex>
            </FormControl>
          ))}
        </Flex>
      </Box>
      <Heading size='md' fontWeight='extrabold'>
        {t('memberbase.importer.data_preview', { defaultValue: 'Data Preview' })}
      </Heading>
      <Box borderColor='table.border' borderWidth='1px' borderRadius='lg' overflowX='auto' w='full'>
        <TableRoot>
          <TableHeader>
            <TableRow>
              {columns.map(({ id, label }) => (
                <TableColumnHeader key={id} fontSize='sm' whiteSpace='nowrap'>
                  {label}
                </TableColumnHeader>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewRows.map((row, index) => (
              <TableRow key={index}>
                {columns.map(({ id }) => (
                  <TableCell key={id}>{getCellValue(row, id)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      </Box>
    </HStack>
  )
}

const ImportDataPreview = ({ columnMapping, setColumnMapping }: ImportDataPreviewProps) => {
  const { t } = useTranslation()
  const methods = useFormContext()
  const spreadsheet = useWatch({
    control: methods.control,
    name: 'spreadsheet',
  })

  const resetImport = () => {
    methods.reset()
    setColumnMapping({})
  }

  return (
    <Flex flexDirection='column' gap={4}>
      <Heading size='md' fontWeight='extrabold'>
        {t('memberbase.importer.map_columns.title', { defaultValue: 'Map Columns' })}
      </Heading>
      <Text color='texts.subtle' fontSize='sm'>
        {t('memberbase.importer.map_columns.subtitle', {
          defaultValue:
            'Map columns from your file to the corresponding fields in our system. Required fields are marked with an asterisk (*).',
        })}
      </Text>
      <FieldsMapper manager={spreadsheet} columnMapping={columnMapping} setColumnMapping={setColumnMapping} />
      <Flex justify='space-between' gap={2} mt={4}>
        <Button type='button' variant='outline' onClick={resetImport}>
          {t('memberbase.importer.reset', { defaultValue: 'Reset Import' })}
        </Button>
        <Button type='submit' form='import-members' loading={methods.formState.isSubmitting}>
          {t('memberbase.importer.submit', { defaultValue: 'Import Data' })}
        </Button>
      </Flex>
    </Flex>
  )
}

export const ImportMembers = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const { open: isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef<HTMLButtonElement>(null)
  const methods = useForm({ defaultValues: { spreadsheet: null } })
  const spreadsheet = useWatch({
    control: methods.control,
    name: 'spreadsheet',
  })
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
  const addMembers = useAddMembers(true)
  const { setJobId } = useOutletContext<MemberbaseTabsContext>()

  const hasSpreadsheet = Boolean(spreadsheet?.filedata)

  const onSubmit = async ({ spreadsheet }: { spreadsheet: any }) => {
    const parsedRows: SpreadsheetRow[] = spreadsheet.filedata.map((row: string[]) => {
      return spreadsheet.heading.reduce((acc: SpreadsheetRow, key: string, index: number) => {
        acc[key] = row[index]
        return acc
      }, {})
    })

    const finalData = mapSpreadsheetData(parsedRows, columnMapping)

    try {
      const data = await addMembers.mutateAsync(finalData)
      setJobId(data?.jobId)
      setColumnMapping({})
      methods.reset()
      onClose()
    } catch (error) {
      console.error(error)
      toast({
        type: 'error',
        title: 'Import failed',
        description: error?.message ?? 'Unexpected error while importing members',
      })
    }
  }

  return (
    <Drawer.Root
      open={isOpen}
      placement='end'
      onOpenChange={({ open }) => (open ? onOpen() : onClose())}
      finalFocusEl={btnRef ? () => btnRef.current : undefined}
      size='md'
    >
      <Drawer.Backdrop />
      <Drawer.Trigger asChild>
        <Button ref={btnRef} variant='outline'>
          <Icon as={LuUpload} />
          {t('memberbase.importer.button', { defaultValue: 'Import' })}
        </Button>
      </Drawer.Trigger>
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.CloseTrigger>
            <CloseButton />
          </Drawer.CloseTrigger>
          <Drawer.Header display='flex' flexDirection='column' alignItems='start'>
            <Drawer.Title>{t('memberbase.importer.title', { defaultValue: 'Import Members' })}</Drawer.Title>
            <Text color='texts.subtle' fontSize='sm'>
              {t('memberbase.importer.subtitle', {
                defaultValue: 'Download a template or import your own CSV, XLS, or XLSX file to add members.',
              })}
            </Text>
          </Drawer.Header>
          <Drawer.Body display='flex' flexDirection='column' gap={4}>
            <FormProvider {...methods}>
              <Box as='form' id='import-members' onSubmit={methods.handleSubmit(onSubmit)}>
                {!hasSpreadsheet ? (
                  <TemplateUploader />
                ) : (
                  <ImportDataPreview columnMapping={columnMapping} setColumnMapping={setColumnMapping} />
                )}
              </Box>
            </FormProvider>
            <Flex justify='flex-end' gap={4}>
              <Drawer.ActionTrigger asChild>
                <Button type='button' variant='outline'>
                  {t('memberbase.importer.cancel', { defaultValue: 'Cancel' })}
                </Button>
              </Drawer.ActionTrigger>
            </Flex>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  )
}
