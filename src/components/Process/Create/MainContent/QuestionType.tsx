import {
  Box,
  Button,
  Flex,
  FieldLabel as FormLabel,
  FieldRoot as FormControl,
  Heading,
  HStack,
  Switch,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { useRef } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { Select } from '~components/shared/Form/Select'
import { DefaultQuestions, SelectorTypes } from '../common'
import { Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay } from '~shared/Modal/Modal'

interface SelectOption {
  value: SelectorTypes
  label: string
}

type MultichoiceWarningModalProps = {
  isOpen: boolean
  onClose: () => void
  updateQuestionType: (newType: SelectorTypes) => void
  pendingTypeRef: React.MutableRefObject<SelectorTypes | null>
}

const MultichoiceWarningModal = ({
  isOpen,
  onClose,
  updateQuestionType,
  pendingTypeRef,
}: MultichoiceWarningModalProps) => {
  const cancel = () => {
    pendingTypeRef.current = null
    onClose()
  }

  const confirm = () => {
    if (pendingTypeRef.current) {
      updateQuestionType(pendingTypeRef.current)
      pendingTypeRef.current = null
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='md'>
      <ModalOverlay />
      <ModalContent p={5}>
        <ModalHeader p={0}>
          <Flex flexDirection='column' gap={3}>
            <Heading size='sm'>
              <Trans i18nKey='process.question_type.confirm.title'>Do you want to switch to Multiple choice?</Trans>
            </Heading>
            <Box fontSize='sm' color='texts.subtle'>
              <Trans i18nKey='process.question_type.confirm.subtitle'>
                Multiple-choice allows only one question. Switching will keep only your first question and discard the
                rest.
              </Trans>
            </Box>
          </Flex>
        </ModalHeader>
        <ModalBody p={0}>
          <Flex justifyContent='flex-end' mt={4} gap={2}>
            <Button variant='outline' onClick={cancel}>
              <Trans i18nKey='common.cancel'>Cancel</Trans>
            </Button>
            <Button onClick={confirm}>
              <Trans i18nKey='common.confirm'>Confirm</Trans>
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export const QuestionType = () => {
  const { t } = useTranslation()
  const { control, setValue, getValues } = useFormContext()
  const { open: isOpen, onOpen, onClose } = useDisclosure()
  const pendingTypeRef = useRef<SelectorTypes | null>(null)

  return (
    <Box display='flex' justifyContent='space-between' flexDirection={{ base: 'column', md: 'row' }}>
      <Box>
        <Text mb={0} fontWeight='extrabold'>
          <Trans i18nKey='process.question_type.title'>Question Type</Trans>
        </Text>
        <Text fontSize='xs' color='texts.subtle'>
          <Trans i18nKey='process.question_type.description'>
            This applies to all questions in this voting process
          </Trans>
        </Text>
      </Box>
      <HStack gap={4} flexDir={{ base: 'column', sm: 'row' }} alignItems={{ base: 'start', sm: 'center' }}>
        <FormControl display='flex' alignItems='center'>
          <FormLabel htmlFor='extended-info' mb='0'>
            <Trans i18nKey='process.extended_info'>Extended info</Trans>
          </FormLabel>
          <Controller
            name='extendedInfo'
            control={control}
            render={({ field }) => (
              <Switch.Root
                id='extended-info'
                checked={!!field.value}
                onCheckedChange={(details) => field.onChange(details.checked)}
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            )}
          />
        </FormControl>
        <Box>
          <Controller
            control={control}
            name='questionType'
            rules={{ required: t('form.error.field_is_required', 'This field is required') }}
            render={({ field }) => {
              const questions = getValues('questions')
              const options: SelectOption[] = [
                { value: SelectorTypes.Single, label: t('process.question_type.single', 'Single choice') },
                { value: SelectorTypes.Multiple, label: t('process.question_type.multiple', 'Multiple choice') },
              ]
              const selectedOption = options.find((opt) => opt.value === field.value)

              const updateQuestionType = (newType: SelectorTypes) => {
                field.onChange(newType)
                const firstQuestion = questions[0]
                setValue('questions', [{ ...DefaultQuestions[newType], ...firstQuestion }])
              }

              const handleOnChange = (option: SelectOption) => {
                const newType = option?.value
                const oldType = field.value

                if (oldType === SelectorTypes.Single && newType === SelectorTypes.Multiple && questions.length > 1) {
                  onOpen()
                  pendingTypeRef.current = newType
                  return
                }
                updateQuestionType(newType)
              }

              return (
                <>
                  <Select
                    value={selectedOption}
                    onChange={handleOnChange}
                    options={options}
                    placeholder={t('process.question_type.single', 'Single choice')}
                    menuPortalTarget={document.body}
                    styles={{ container: (p) => ({ ...p, width: 'max-content', maxWidth: '100%' }) }}
                  />
                  <MultichoiceWarningModal
                    isOpen={isOpen}
                    onClose={onClose}
                    updateQuestionType={updateQuestionType}
                    pendingTypeRef={pendingTypeRef}
                  />
                </>
              )
            }}
          />
        </Box>
      </HStack>
    </Box>
  )
}
