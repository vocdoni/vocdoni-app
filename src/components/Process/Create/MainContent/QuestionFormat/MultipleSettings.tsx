import { Box, chakra, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuMinus, LuPlus } from 'react-icons/lu'
import { TABULAR, textType } from '../../editor/typography'
import { EASE } from '../../VoterAuthentication/motion'
import { Amount, clamp, detectAmount, exactValue, rangeMax, rangeMin, uptoValue } from './pick'

const Stepper = ({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  label: string
}) => {
  const btn = {
    type: 'button' as const,
    w: '32px',
    h: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'texts.subtle',
    _hover: { bg: 'auth.bg', color: 'texts.primary' },
    _disabled: { opacity: 0.35, cursor: 'not-allowed' },
    css: { transition: `background-color 0.12s ${EASE}` },
  }
  return (
    <HStack
      gap={0}
      borderWidth='0.5px'
      borderColor='table.border'
      borderRadius='md'
      overflow='hidden'
      bg='auth.card.bg'
    >
      <chakra.button
        {...btn}
        aria-label={`${label} −`}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - 1, min, max))}
      >
        <Icon as={LuMinus} boxSize={3.5} />
      </chakra.button>
      <Box
        minW='38px'
        h='32px'
        px={1}
        textAlign='center'
        fontSize='sm'
        fontWeight={600}
        css={TABULAR}
        borderInlineWidth='0.5px'
        borderColor='table.border'
        display='flex'
        alignItems='center'
        justifyContent='center'
      >
        {value}
      </Box>
      <chakra.button
        {...btn}
        aria-label={`${label} +`}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1, min, max))}
      >
        <Icon as={LuPlus} boxSize={3.5} />
      </chakra.button>
    </HStack>
  )
}

/**
 * Settings for the "Pick several" method: how many options a voter may choose.
 * Writes the global min/max fields (unchanged semantics). Lives inside the
 * Question format popover.
 */
export const MultipleSettings = ({ index }: { index: number }) => {
  const { t } = useTranslation()
  const { watch, setValue } = useFormContext()
  const options = watch(`questions.${index}.options`) || []
  const total = options.length
  const min: number | null = watch('minNumberOfChoices')
  const max: number | null = watch('maxNumberOfChoices')
  const amount = detectAmount(min, max)

  const setMin = (v: number | null) => setValue('minNumberOfChoices', v, { shouldDirty: true, shouldValidate: true })
  const setMax = (v: number | null) => setValue('maxNumberOfChoices', v, { shouldDirty: true, shouldValidate: true })

  useEffect(() => {
    if (min != null && min > total) setMin(total)
    if (max != null && max > total) setMax(total)
    if (min != null && max != null && max < min) setMax(min)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total])

  const choose = (next: Amount) => {
    if (next === 'any') {
      setMin(null)
      setMax(null)
    } else if (next === 'upto') {
      setMin(null)
      setMax(uptoValue(max, total))
    } else if (next === 'exactly') {
      const e = exactValue(min, max, total)
      setMin(e)
      setMax(e)
    } else {
      // Ensure a genuine range (max > min); otherwise min === max reads as "exactly".
      let a = clamp(min ?? 1, 1, total)
      let b = clamp(max ?? total, 1, total)
      if (b <= a) {
        if (a < total) b = a + 1
        else {
          a = Math.max(1, total - 1)
          b = total
        }
      }
      setMin(a)
      setMax(b)
    }
  }

  const rows: { id: Amount; title: string; desc: string }[] = [
    {
      id: 'any',
      title: t('editor.limits.any', { defaultValue: 'Any number' }),
      desc: t('editor.limits.any_desc', { defaultValue: 'Vote for as many as they like' }),
    },
    {
      id: 'upto',
      title: t('editor.limits.upto', { defaultValue: 'Up to a limit' }),
      desc: t('editor.limits.upto_desc', { defaultValue: 'No more than a set number' }),
    },
    {
      id: 'exactly',
      title: t('editor.limits.exactly', { defaultValue: 'Exactly' }),
      desc: t('editor.limits.exactly_desc', { defaultValue: 'A fixed number of picks' }),
    },
    {
      id: 'range',
      title: t('editor.limits.range', { defaultValue: 'A range' }),
      desc: t('editor.limits.range_desc', { defaultValue: 'Between a minimum and maximum' }),
    },
  ]

  return (
    <VStack align='stretch' gap={2}>
      {rows.map((row) => {
        const on = amount === row.id
        return (
          <Box
            key={row.id}
            role='radio'
            aria-checked={on}
            tabIndex={0}
            onClick={() => choose(row.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                choose(row.id)
              }
            }}
            cursor='pointer'
            borderWidth='1px'
            borderColor={on ? 'brand.500' : 'table.border'}
            bg='auth.card.bg'
            borderRadius='lg'
            p={3}
            css={{ transition: `border-color 0.15s ${EASE}` }}
            _hover={!on ? { borderColor: 'gray.400' } : undefined}
          >
            <HStack align='start' gap={3}>
              <Box
                mt='2px'
                boxSize='18px'
                borderRadius='full'
                borderWidth='1.5px'
                borderColor={on ? 'brand.500' : 'gray.300'}
                display='flex'
                alignItems='center'
                justifyContent='center'
                flexShrink={0}
                css={{ transition: `border-color 0.15s ${EASE}` }}
              >
                {on && <Box boxSize='8px' borderRadius='full' bg='brand.500' />}
              </Box>
              <Box flex={1} minW={0}>
                <Text {...textType.cardTitle}>{row.title}</Text>
                <Text {...textType.cardDesc}>{row.desc}</Text>

                {on && row.id === 'upto' && (
                  <HStack gap={2} mt={2.5} onClick={(e) => e.stopPropagation()}>
                    <Text fontSize='sm' color='texts.subtle'>
                      {t('editor.limits.no_more_than', { defaultValue: 'No more than' })}
                    </Text>
                    <Stepper
                      value={uptoValue(max, total)}
                      min={1}
                      max={total}
                      onChange={setMax}
                      label={t('editor.limits.max_label', { defaultValue: 'Maximum' })}
                    />
                  </HStack>
                )}

                {on && row.id === 'exactly' && (
                  <HStack gap={2} mt={2.5} onClick={(e) => e.stopPropagation()}>
                    <Stepper
                      value={exactValue(min, max, total)}
                      min={1}
                      max={total}
                      onChange={(v) => {
                        setMin(v)
                        setMax(v)
                      }}
                      label={t('editor.limits.exactly', { defaultValue: 'Exactly' })}
                    />
                    <Text fontSize='sm' color='texts.subtle'>
                      {t('editor.limits.options_label', { defaultValue: 'options' })}
                    </Text>
                  </HStack>
                )}

                {on && row.id === 'range' && (
                  <HStack gap={2} mt={2.5} flexWrap='wrap' onClick={(e) => e.stopPropagation()}>
                    <Text fontSize='sm' color='texts.subtle'>
                      {t('editor.limits.between', { defaultValue: 'Between' })}
                    </Text>
                    <Stepper
                      value={rangeMin(min, total)}
                      min={1}
                      max={total}
                      onChange={(v) => {
                        setMin(v)
                        if (rangeMax(min, max, total) < v) setMax(v)
                      }}
                      label={t('editor.limits.min_label', { defaultValue: 'Minimum' })}
                    />
                    <Text fontSize='sm' color='texts.subtle'>
                      {t('editor.limits.and', { defaultValue: 'and' })}
                    </Text>
                    <Stepper
                      value={rangeMax(min, max, total)}
                      min={rangeMin(min, total)}
                      max={total}
                      onChange={setMax}
                      label={t('editor.limits.max_label', { defaultValue: 'Maximum' })}
                    />
                  </HStack>
                )}
              </Box>
            </HStack>
          </Box>
        )
      })}
    </VStack>
  )
}
