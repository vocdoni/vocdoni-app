import { chakra, VisuallyHidden } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

export const MASK_DOTS = '•••'

type MaskedValueProps = {
  /** What the value is, as read out: "national ID" */
  label: string
  /** The characters left visible at the end, if any */
  tail?: string
}

/**
 * A value hidden but for its last characters ("•••23A"). Screen readers hear "national ID ending in
 * 23A" instead of the dots.
 */
export const MaskedValue = ({ label, tail }: MaskedValueProps) => {
  const { t } = useTranslation()

  return (
    // ph-no-capture: even the visible tail is member data
    <chakra.span className='ph-no-capture' whiteSpace='nowrap' fontVariantNumeric='tabular-nums'>
      <span aria-hidden='true'>
        {MASK_DOTS}
        {tail}
      </span>
      <VisuallyHidden>
        {tail
          ? t('masked_value.ending_in', { defaultValue: '{{label}} ending in {{tail}}', label, tail })
          : t('masked_value.hidden', { defaultValue: '{{label}} hidden', label })}
      </VisuallyHidden>
    </chakra.span>
  )
}
