import { SegmentGroup } from '@chakra-ui/react'
import { useTheme } from 'next-themes'
import { type ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'

type Mode = 'system' | 'light' | 'dark'

const isMode = (value: string | null | undefined): value is Mode =>
  value === 'system' || value === 'light' || value === 'dark'

type AppearanceSegmentProps = Omit<ComponentProps<typeof SegmentGroup.Root>, 'value' | 'onValueChange'>

// Text only on purpose: three positions, no sun or moon icons.
export const AppearanceSegment = (props: AppearanceSegmentProps) => {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()

  const items: { value: Mode; label: string }[] = [
    { value: 'system', label: t('system', 'System') },
    { value: 'light', label: t('light', 'Light') },
    { value: 'dark', label: t('dark', 'Dark') },
  ]

  return (
    <SegmentGroup.Root
      aria-label={t('appearance', 'Appearance')}
      {...props}
      value={isMode(theme) ? theme : 'system'}
      onValueChange={({ value }) => {
        if (isMode(value)) setTheme(value)
      }}
    >
      <SegmentGroup.Indicator />
      <SegmentGroup.Items items={items} />
    </SegmentGroup.Root>
  )
}
