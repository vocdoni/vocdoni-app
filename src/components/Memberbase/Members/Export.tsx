import {
  Box,
  Button,
  CheckboxControl,
  CheckboxHiddenInput,
  CheckboxLabel,
  CheckboxRoot,
  Flex,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuFileDown, LuFileSpreadsheet } from 'react-icons/lu'
import { useTable } from '../TableProvider'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '~shared/Modal/Modal'

type RadioCardProps = {
  label: string
  value: string
  isSelected: boolean
  onSelect: (value: string) => void
}

export const RadioCard = ({ label, value, isSelected, onSelect }: RadioCardProps) => {
  return (
    <Button flex='1' onClick={() => onSelect(value)} p={4} variant={isSelected ? 'solid' : 'outline'}>
      <HStack gap={2}>
        <Icon as={LuFileSpreadsheet} boxSize={4} />
        <Text as='span'>{label}</Text>
      </HStack>
      <input type='radio' value={value} checked={isSelected} onChange={() => {}} style={{ display: 'none' }} />
    </Button>
  )
}

export const ExportMembers = () => {
  const { t } = useTranslation()
  const { open: isOpen, onOpen, onClose } = useDisclosure()
  const { columns, selectedRows } = useTable()

  const methods = useForm({
    defaultValues: {
      fileFormat: 'csv',
      exportedColumns: columns.map((col) => col.id),
    },
  })

  const fileFormats = [
    { label: 'CSV', value: 'csv' },
    { label: 'Excel', value: 'xlsx' },
  ]

  const selectedColumnCount =
    useWatch({
      control: methods.control,
      name: 'exportedColumns',
    })?.length || 0

  const onExport = (data) => {
    console.log('Exporting:', {
      members: selectedRows,
      ...data,
    })
    onClose()
  }

  return (
    <>
      <Button variant='outline' onClick={onOpen} disabled={true}>
        <HStack gap={2}>
          <Icon as={LuFileDown} />
          <Text as='span'>{t('memberbase.exporter.button', { defaultValue: 'Export' })}</Text>
        </HStack>
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading fontSize='lg' fontWeight='bold'>
              {t('memberbase.exporter.title', { defaultValue: 'Export Members' })}
            </Heading>
            <Text fontSize='sm' color='texts.subtle'>
              {t('memberbase.exporter.subtitle', {
                defaultValue: 'Configure your export options. The export will include {{count}} members.',
                count: selectedRows.length,
              })}
            </Text>
          </ModalHeader>
          <ModalCloseButton />

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onExport)}>
              <ModalBody display='flex' flexDirection='column' gap={6}>
                <Box>
                  <Text fontWeight='medium' mb={2}>
                    {t('memberbase.exporter.file_format', { defaultValue: 'File Format' })}
                  </Text>
                  <Controller
                    name='fileFormat'
                    control={methods.control}
                    render={({ field }) => (
                      <Flex gap={2}>
                        {fileFormats.map((format) => (
                          <RadioCard
                            key={format.value}
                            label={format.label}
                            value={format.value}
                            isSelected={field.value === format.value}
                            onSelect={field.onChange}
                          />
                        ))}
                      </Flex>
                    )}
                  />
                </Box>
                <Box>
                  <Text fontWeight='medium' mb={2}>
                    {t('memberbase.exporter.columns', { defaultValue: 'Columns to Export' })}
                  </Text>
                  <Box border='1px solid' borderColor='gray.700' borderRadius='md' px={4} py={2}>
                    <Controller
                      name='exportedColumns'
                      control={methods.control}
                      render={({ field }) => (
                        <Stack gap={3}>
                          {columns
                            .filter((col) => col.visible)
                            .map((col) => (
                              <CheckboxRoot
                                key={col.id}
                                checked={field.value.includes(col.id)}
                                onCheckedChange={(details) => {
                                  const isChecked = Boolean(details.checked)
                                  const value = col.id
                                  field.onChange(
                                    isChecked ? [...field.value, value] : field.value.filter((v) => v !== value)
                                  )
                                }}
                                colorPalette='black'
                              >
                                <CheckboxHiddenInput value={col.id} />
                                <CheckboxControl />
                                <CheckboxLabel>{col.label}</CheckboxLabel>
                              </CheckboxRoot>
                            ))}
                        </Stack>
                      )}
                    />
                  </Box>
                </Box>
              </ModalBody>
              <ModalFooter>
                <Button variant='outline' onClick={onClose}>
                  {t('memberbase.exporter.cancel', { defaultValue: 'Cancel' })}
                </Button>
                <Button type='submit'>
                  {t('memberbase.exporter.export', {
                    defaultValue: 'Export {{count}} columns',
                    count: selectedColumnCount,
                  })}
                </Button>
              </ModalFooter>
            </form>
          </FormProvider>
        </ModalContent>
      </Modal>
    </>
  )
}
