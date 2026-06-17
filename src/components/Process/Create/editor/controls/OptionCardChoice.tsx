import { Box, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { IconType } from 'react-icons'
import { LuCheck } from 'react-icons/lu'
import { EASE, popIn } from '../../VoterAuthentication/motion'

export type OptionCardItem<T> = {
  value: T
  label: string
  description?: string
  icon: IconType
}

export type OptionCardChoiceProps<T> = {
  /** null/undefined renders with nothing selected. */
  value: T | null | undefined
  onChange: (value: T) => void
  options: OptionCardItem<T>[]
  columns?: number
  ariaLabel?: string
}

/**
 * A segmented selector rendered as labelled, icon-led cards instead of a
 * dropdown — self-explanatory and far more premium. Single-select. Reused for
 * result visibility and voting power.
 */
export function OptionCardChoice<T extends string | number | boolean>({
  value,
  onChange,
  options,
  columns = 2,
  ariaLabel,
}: OptionCardChoiceProps<T>) {
  // `value` may be null/undefined when the admin hasn't chosen yet → no card highlighted.
  return (
    <SimpleGrid columns={{ base: 1, sm: columns }} gap={2.5} role='radiogroup' aria-label={ariaLabel}>
      {options.map((opt) => {
        const selected = opt.value === value
        return (
          <Box
            key={String(opt.value)}
            role='radio'
            aria-checked={selected}
            tabIndex={0}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onChange(opt.value)
              }
            }}
            position='relative'
            cursor='pointer'
            borderWidth='2px'
            borderStyle='solid'
            borderColor={selected ? 'brand.500' : 'table.border'}
            bg={selected ? 'auth.bg' : 'transparent'}
            borderRadius='lg'
            p={3}
            css={{ transition: `border-color 0.15s ${EASE}, background-color 0.15s ${EASE}, transform 0.15s ${EASE}` }}
            _hover={!selected ? { borderColor: 'gray.400', transform: 'translateY(-1px)' } : undefined}
          >
            <VStack align='start' gap={1}>
              <Box display='flex' w='full' alignItems='center' justifyContent='space-between'>
                <Box color={selected ? 'texts.primary' : 'texts.subtle'} css={{ transition: `color 0.15s ${EASE}` }}>
                  <Icon as={opt.icon} boxSize={5} />
                </Box>
                {selected && (
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
              </Box>
              <Text fontSize='sm' fontWeight='semibold' lineHeight={1.2}>
                {opt.label}
              </Text>
              {opt.description && (
                <Text fontSize='xs' color='texts.subtle'>
                  {opt.description}
                </Text>
              )}
            </VStack>
          </Box>
        )
      })}
    </SimpleGrid>
  )
}
