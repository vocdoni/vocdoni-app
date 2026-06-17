import { Box, FieldErrorText, FieldRoot, Input } from '@chakra-ui/react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Process } from '../common'
import { inputType } from '../editor/typography'
import { EASE } from '../VoterAuthentication/motion'
import { useProcessTemplates } from '../TemplateProvider'

/**
 * Borderless document-style title with an animated focus underline that grows
 * from the left. Registration + required validation unchanged.
 */
export const TitleField = () => {
  const { t } = useTranslation()
  const {
    register,
    formState: { errors },
  } = useFormContext<Process>()
  const { activeTemplate, placeholders } = useProcessTemplates()

  const placeholder =
    placeholders[activeTemplate]?.title ??
    t('process.create.description.title', { defaultValue: 'Voting Process Title' })

  return (
    <FieldRoot invalid={!!errors.title}>
      <Box position='relative' w='full' css={{ '&:focus-within [data-title-underline]': { transform: 'scaleX(1)' } }}>
        <Input
          variant='borderless'
          placeholder={placeholder}
          px={0}
          css={{ textWrap: 'balance' }}
          {...inputType.processTitle}
          {...register('title', { required: t('form.error.required', { defaultValue: 'This field is required' }) })}
        />
        <Box
          aria-hidden
          data-title-underline
          position='absolute'
          bottom={0}
          left={0}
          h='2px'
          w='full'
          bg='brand.500'
          transformOrigin='left'
          css={{ transform: 'scaleX(0)', transition: `transform 0.25s ${EASE}` }}
        />
      </Box>
      <FieldErrorText>{errors.title?.message?.toString()}</FieldErrorText>
    </FieldRoot>
  )
}
