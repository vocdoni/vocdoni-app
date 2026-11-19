import {
  AlertDescription,
  AlertIndicator,
  AlertRoot as Alert,
  Button,
  CheckboxControl,
  CheckboxHiddenInput,
  CheckboxLabel,
  CheckboxRoot,
  chakra,
  Dialog,
  FieldErrorText as FormErrorMessage,
  FieldHelperText as FormHelperText,
  FieldLabel as FormLabel,
  FieldRoot as FormControl,
  Flex,
  Input,
  Portal,
  PinInputControl,
  PinInputHiddenInput,
  PinInputInput,
  PinInputRoot,
  Stack,
  Text,
  VStack,
  type BoxProps,
  type ButtonProps,
} from '@chakra-ui/react'
import { defineComponent, type ComponentsPartialDefinition } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'
import { CloseButton } from '~components/ui/CloseButton'
import { DialogHeader } from '~components/ui/DialogHeader'

// The voter's CSP identify flow: the packaged CspAuth decides what each slot shows, these only draw it.
export const cspAuthComponents: ComponentsPartialDefinition = {
  CspAuthTrigger: defineComponent<'CspAuthTrigger', ButtonProps>(({ label, onClick, loading, ...props }) => (
    <Button type='button' w='full' onClick={onClick} aria-busy={loading || undefined} {...props}>
      {label}
    </Button>
  )),
  CspAuthLogout: defineComponent<'CspAuthLogout', ButtonProps>(({ label, onClick, ...props }) => (
    <Button type='button' onClick={onClick} {...props}>
      {label}
    </Button>
  )),
  CspAuthModal: defineComponent<'CspAuthModal', BoxProps>(
    ({ isOpen, onClose, title, closeLabel, content, ...props }) => (
      <Dialog.Root size='sm' open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner p={{ base: '4', md: '6' }}>
            <Dialog.Content w='full' maxW='lg' {...props}>
              <Dialog.CloseTrigger asChild>
                <CloseButton aria-label={closeLabel} />
              </Dialog.CloseTrigger>
              <DialogHeader title={title} />
              <Dialog.Body>{content}</Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    )
  ),
  CspAuthIdentifyForm: defineComponent<'CspAuthIdentifyForm', BoxProps>(
    ({ fields, terms, termsField, error, loading, submitLabel, info, onSubmit, ...props }) => {
      const { t } = useTranslation()

      return (
        <chakra.form {...props} noValidate onSubmit={onSubmit} w='full'>
          <Stack gap='4'>
            {fields.map((field) => (
              <FormControl key={field.name} invalid={!!field.error} required={field.required}>
                <FormLabel>{field.label}</FormLabel>
                <Input {...field.inputProps} type={field.type} />
                {field.helper ? (
                  <FormHelperText>
                    {/* The contact must match the census record, so the warning leads the hint. */}
                    {field.name === 'contact' ? (
                      <>
                        <Text as='span' fontWeight='bold'>
                          {t('csp.important')}:
                        </Text>{' '}
                      </>
                    ) : null}
                    {field.helper}
                  </FormHelperText>
                ) : null}
                {field.error ? <FormErrorMessage>{field.error}</FormErrorMessage> : null}
              </FormControl>
            ))}

            {error ? (
              <Alert status='error' role='alert'>
                <AlertIndicator />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {termsField ? (
              <FormControl invalid={!!termsField.error}>
                <CheckboxRoot>
                  <CheckboxHiddenInput {...termsField.inputProps} />
                  <CheckboxControl />
                  <CheckboxLabel>{terms}</CheckboxLabel>
                </CheckboxRoot>
                {termsField.error ? <FormErrorMessage>{termsField.error}</FormErrorMessage> : null}
              </FormControl>
            ) : null}
            {!termsField && terms ? <Text textStyle='body-sm'>{terms}</Text> : null}

            <Button type='submit' w='full' mt='2' loading={loading}>
              {submitLabel}
            </Button>
            {info ? (
              <Text textAlign='center' textStyle='body-sm'>
                {info}
              </Text>
            ) : null}
          </Stack>
        </chakra.form>
      )
    }
  ),
  CspAuthCodeForm: defineComponent<'CspAuthCodeForm', BoxProps>(
    ({
      title,
      helper,
      code,
      length,
      onCodeChange,
      error,
      notice,
      loading,
      submitLabel,
      onSubmit,
      resendLabel,
      onResend,
      resending,
      startOverLabel,
      onStartOver,
      actionsDisabled,
      footer,
      ...props
    }) => (
      <chakra.form {...props} noValidate onSubmit={onSubmit} w='full'>
        <VStack gap='5' align='stretch'>
          <Text fontWeight='medium'>{title}</Text>
          <FormControl>
            <PinInputRoot
              size='lg'
              count={length}
              value={Array.from({ length }, (_, index) => code[index] ?? '')}
              onValueChange={({ valueAsString }) => onCodeChange(valueAsString)}
              autoFocus
            >
              <PinInputHiddenInput />
              <PinInputControl w='full' gap='3'>
                {Array.from({ length }, (_, index) => (
                  <PinInputInput key={index} index={index} />
                ))}
              </PinInputControl>
            </PinInputRoot>
            <FormHelperText mt='3'>{helper}</FormHelperText>
          </FormControl>

          {notice ? (
            <Text role='status' textStyle='body-sm' color='fg.muted'>
              {notice}
            </Text>
          ) : null}
          {error ? (
            <Alert status='error' role='alert'>
              <AlertIndicator />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button type='submit' w='full' loading={loading}>
            {submitLabel}
          </Button>
          <Flex justify='space-between' wrap='wrap' gap='2'>
            <Button
              type='button'
              variant='link'
              onClick={onResend}
              disabled={actionsDisabled || resending}
              loading={resending}
            >
              {resendLabel}
            </Button>
            <Button type='button' variant='link' onClick={onStartOver} disabled={actionsDisabled}>
              {startOverLabel}
            </Button>
          </Flex>
          {footer ? (
            <Text textStyle='body-sm' color='fg.muted'>
              {footer}
            </Text>
          ) : null}
        </VStack>
      </chakra.form>
    )
  ),
}
