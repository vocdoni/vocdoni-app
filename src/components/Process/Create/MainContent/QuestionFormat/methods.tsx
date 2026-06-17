import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { IconType } from 'react-icons'
import { LuCircleDot, LuListChecks } from 'react-icons/lu'
import { SelectorTypes } from '../../common'
import { detectAmount, exactValue, rangeMax, rangeMin, uptoValue } from './pick'

export type MethodId = 'single' | 'multiple'

export type VotingMethod = {
  id: MethodId
  name: string
  what: string
  /** Affordance shown to voters — drives the morphing preview. */
  affordance: 'radio' | 'checkbox'
  icon: IconType
}

export const methodFromType = (questionType: SelectorTypes): MethodId =>
  questionType === SelectorTypes.Multiple ? 'multiple' : 'single'

/**
 * The registry of available voting methods. Extensible: add `ranked`, `score`,
 * … here (plus a Settings panel + mapper output) and they appear everywhere
 * automatically. Today only single & multiple are registered.
 */
export const useVotingMethods = (): VotingMethod[] => {
  const { t } = useTranslation()
  return [
    {
      id: 'single',
      name: t('editor.method.single_name', { defaultValue: 'Single choice' }),
      what: t('editor.method.single_what', { defaultValue: 'Voters pick one option' }),
      affordance: 'radio',
      icon: LuCircleDot,
    },
    {
      id: 'multiple',
      name: t('editor.method.multiple_name', { defaultValue: 'Multiple choice' }),
      what: t('editor.method.multiple_what', { defaultValue: 'Voters can pick several options' }),
      affordance: 'checkbox',
      icon: LuListChecks,
    },
  ]
}

/** Plain-language footer summary for the card (method phrase + option style). */
export const useFormatSummary = (index: number) => {
  const { t } = useTranslation()
  const { watch } = useFormContext()
  const questionType = watch('questionType')
  const extendedInfo = watch('extendedInfo')
  const options = watch(`questions.${index}.options`) || []
  const total = options.length
  const min: number | null = watch('minNumberOfChoices')
  const max: number | null = watch('maxNumberOfChoices')

  let method: string
  if (methodFromType(questionType) === 'single') {
    method = t('editor.summary.method_single', { defaultValue: 'Single choice' })
  } else {
    const amount = detectAmount(min, max)
    method =
      amount === 'any'
        ? t('editor.summary.method_any', { defaultValue: 'Multiple choice' })
        : amount === 'upto'
          ? t('editor.summary.method_upto', { defaultValue: 'Multiple choice · up to {{n}}', n: uptoValue(max, total) })
          : amount === 'exactly'
            ? t('editor.summary.method_exactly', {
                defaultValue: 'Multiple choice · exactly {{n}}',
                n: exactValue(min, max, total),
              })
            : t('editor.summary.method_range', {
                defaultValue: 'Multiple choice · {{a}}–{{b}}',
                a: rangeMin(min, total),
                b: rangeMax(min, max, total),
              })
  }

  const style = extendedInfo
    ? t('editor.summary.style_cards', { defaultValue: 'Card options' })
    : t('editor.summary.style_text', { defaultValue: 'Text options' })

  return { method, style }
}
