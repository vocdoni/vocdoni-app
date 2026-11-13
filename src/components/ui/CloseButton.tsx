import { CloseButton as ChakraCloseButton, type CloseButtonProps } from '@chakra-ui/react'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

// Chakra's close button is labelled "Close" in English only; callers with a more specific name pass `aria-label`.
export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>((props, ref) => {
  const { t } = useTranslation()
  return <ChakraCloseButton ref={ref} aria-label={t('close', { defaultValue: 'Close' })} {...props} />
})
CloseButton.displayName = 'CloseButton'
