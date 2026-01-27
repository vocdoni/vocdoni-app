import {
  Box,
  Button,
  Dialog,
  FieldRoot as FormControl,
  FieldLabel as FormLabel,
  HStack,
  Switch,
  Text,
} from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { Select } from '~components/shared/Form/Select'
import { DefaultQuestions, SelectorTypes } from '../common'

interface SelectOption {
  value: SelectorTypes
  label: string
}

type MultichoiceWarningModalProps = {
  open: boolean
  onOpenChange: (details: { open: boolean }) => void
  updateQuestionType: (newType: SelectorTypes) => void
  pendingTypeRef: React.MutableRefObject<SelectorTypes | null>
}

const MultichoiceWarningModal = ({
  open,
  onOpenChange,
  updateQuestionType,
  pendingTypeRef,
}: MultichoiceWarningModalProps) => {
  const close = () => onOpenChange({ open: false })

  const cancel = () => {
    pendingTypeRef.current = null
    close()
  }

  const confirm = () => {
    if (pendingTypeRef.current) {
      updateQuestionType(pendingTypeRef.current)
      pendingTypeRef.current = null
    }
    close()
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='md'>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header display='flex' flexDirection='column' alignItems='flex-start' gap={1}>
            <Dialog.Title>
              <Trans i18nKey='process.question_type.confirm.title'>Do you want to switch to Multiple choice?</Trans>
            </Dialog.Title>
            <Box fontSize='sm' color='texts.subtle'>
              <Trans i18nKey='process.question_type.confirm.subtitle'>
                Multiple-choice allows only one question. Switching will keep only your first question and discard the
                rest.
              </Trans>
            </Box>
          </Dialog.Header>
          <Dialog.Footer>
            <Button variant='outline' onClick={cancel}>
              <Trans i18nKey='common.cancel'>Cancel</Trans>
            </Button>
            <Button onClick={confirm}>
              <Trans i18nKey='common.confirm'>Confirm</Trans>
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

export const QuestionType = () => {
  const { t } = useTranslation()
  const { control, setValue, getValues } = useFormContext()
  const [isWarningModalOpen, setWarningModalOpen] = useState(false)
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
                  setWarningModalOpen(true)
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
                    open={isWarningModalOpen}
                    onOpenChange={({ open }) => setWarningModalOpen(open)}
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
