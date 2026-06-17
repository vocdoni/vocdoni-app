import { Box, HStack, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuCheck } from 'react-icons/lu'
import { SelectorTypes } from '../../common'
import { textType } from '../../editor/typography'
import { EASE, popIn } from '../../VoterAuthentication/motion'
import { MultipleSettings } from './MultipleSettings'
import { methodFromType, MethodId, useVotingMethods } from './methods'

/**
 * Explicit, always-visible voting-method selector. Both methods are shown as
 * cards (never hidden behind a menu); choosing "Multiple choice" keeps the
 * how-many sub-options rendered inline so the admin can pick the sub-system.
 */
export const MethodPicker = ({ index }: { index: number }) => {
  const { t } = useTranslation()
  const { watch, setValue, getValues } = useFormContext()
  const methods = useVotingMethods()
  const current = methodFromType(watch('questionType'))

  const select = (id: MethodId) => {
    if (id === current) return
    if (id === 'multiple') {
      // Multiple-choice supports a single question — collapse any extras.
      const qs = getValues('questions')
      if (qs.length > 1) setValue('questions', [qs[0]], { shouldDirty: true })
      setValue('questionType', SelectorTypes.Multiple, { shouldDirty: true })
    } else {
      // Single-question toggle: change only the type so the card never remounts
      // (keeps the Voting configuration panel open).
      setValue('questionType', SelectorTypes.Single, { shouldDirty: true })
      setValue('minNumberOfChoices', null, { shouldDirty: true })
      setValue('maxNumberOfChoices', null, { shouldDirty: true })
    }
  }

  return (
    <VStack align='stretch' gap={3}>
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={2}>
        {methods.map((m) => {
          const on = current === m.id
          return (
            <Box
              key={m.id}
              role='radio'
              aria-checked={on}
              tabIndex={0}
              onClick={() => select(m.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  select(m.id)
                }
              }}
              cursor='pointer'
              borderWidth='2px'
              borderColor={on ? 'brand.500' : 'table.border'}
              bg={on ? 'auth.card.bg' : 'transparent'}
              borderRadius='lg'
              p={3}
              css={{ transition: `border-color 0.15s ${EASE}, background-color 0.15s ${EASE}` }}
              _hover={!on ? { borderColor: 'gray.400' } : undefined}
            >
              <HStack justify='space-between' mb={1.5}>
                <Box color={on ? 'texts.primary' : 'texts.subtle'} css={{ transition: `color 0.15s ${EASE}` }}>
                  <Icon as={m.icon} boxSize={5} />
                </Box>
                {on && (
                  <Box
                    boxSize={5}
                    borderRadius='full'
                    bg='brand.500'
                    color='white'
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    css={{ animation: `${popIn} 0.25s ${EASE} both` }}
                  >
                    <Icon as={LuCheck} boxSize={3} />
                  </Box>
                )}
              </HStack>
              <Text {...textType.cardTitle}>{m.name}</Text>
              <Text {...textType.cardDesc}>{m.what}</Text>
            </Box>
          )
        })}
      </SimpleGrid>

      {current === 'multiple' && (
        <Box css={{ animation: `${popIn} 0.2s ${EASE} both` }}>
          <Text {...textType.helper} mb={2}>
            {t('editor.format.how_many', { defaultValue: 'How many options can voters pick?' })}
          </Text>
          <MultipleSettings index={index} />
        </Box>
      )}
    </VStack>
  )
}
