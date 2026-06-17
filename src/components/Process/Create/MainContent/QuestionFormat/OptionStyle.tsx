import { chakra, HStack, Icon } from '@chakra-ui/react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuAlignLeft, LuImage } from 'react-icons/lu'
import { SURFACE } from '../../editor/surfaces'
import { EASE } from '../../VoterAuthentication/motion'

/** "Option display" — Text vs Cards, icon-only. Writes the global extendedInfo. */
export const OptionStyle = () => {
  const { t } = useTranslation()
  const { control } = useFormContext()

  const items = [
    { value: false, icon: LuAlignLeft, label: t('editor.summary.style_text', { defaultValue: 'Text options' }) },
    { value: true, icon: LuImage, label: t('editor.summary.style_cards', { defaultValue: 'Card options' }) },
  ]

  return (
    <Controller
      control={control}
      name='extendedInfo'
      render={({ field }) => (
        <HStack gap={1} p={1} borderRadius='lg' bg={SURFACE.inset} borderWidth='1px' borderColor={SURFACE.border}>
          {items.map((it) => {
            const on = !!field.value === it.value
            return (
              <chakra.button
                type='button'
                key={String(it.value)}
                onClick={() => field.onChange(it.value)}
                aria-label={it.label}
                aria-pressed={on}
                title={it.label}
                w='36px'
                h='32px'
                display='inline-flex'
                alignItems='center'
                justifyContent='center'
                borderRadius='md'
                bg={on ? SURFACE.surface : 'transparent'}
                color={on ? 'texts.primary' : 'texts.subtle'}
                boxShadow={on ? '0 1px 3px -1px rgba(17,18,20,0.18)' : 'none'}
                css={{ transition: `background-color 0.18s ${EASE}, color 0.18s ${EASE}` }}
                _hover={!on ? { color: 'texts.primary' } : undefined}
              >
                <Icon as={it.icon} boxSize={4} />
              </chakra.button>
            )
          })}
        </HStack>
      )}
    />
  )
}
