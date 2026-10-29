import { ButtonGroup, ButtonGroupProps, Icon, IconButton, IconButtonProps } from '@chakra-ui/react'
import { useTheme } from 'next-themes'
import { type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { DarkModeIcon, LegacyDarkModeIcon, LegacyLightModeIcon, LightModeIcon, SystemModeIcon } from '~theme/icons'
import type { IconType } from '~theme/icons'
import { Tooltip } from '~components/ui/Tooltip'
import { useColorMode, useColorModeValue } from '~theme/color-mode'

type ColorModeSwitcherProps = Omit<IconButtonProps, 'aria-label'>

export const ColorModeSwitcher: FC<ColorModeSwitcherProps> = (props) => {
  const { t } = useTranslation()
  const { toggleColorMode } = useColorMode()
  const text = useColorModeValue('dark', 'light')
  const SwitchIcon = useColorModeValue(LegacyDarkModeIcon, LegacyLightModeIcon)

  return (
    <IconButton
      variant='subtle'
      colorPalette='gray'
      onClick={toggleColorMode}
      aria-label={t('switch_mode', { defaultValue: 'Switch to {{ mode }} mode', mode: text })}
      {...props}
    >
      <Icon as={SwitchIcon} />
    </IconButton>
  )
}

type Mode = 'light' | 'dark' | 'system'

export const ThemeToggleGroup = (props: ButtonGroupProps) => {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const selected: Mode = theme === 'light' || theme === 'dark' || theme === 'system' ? theme : 'system'

  const modes: { mode: Mode; label: string; icon: IconType }[] = [
    { mode: 'system', label: t('system', 'System'), icon: SystemModeIcon },
    { mode: 'light', label: t('light', 'Light'), icon: LightModeIcon },
    { mode: 'dark', label: t('dark', 'Dark'), icon: DarkModeIcon },
  ]

  return (
    <ButtonGroup
      variant='outline'
      aria-label={t('color_mode_switcher', 'Color mode switcher')}
      {...props}
      border='1px solid'
      borderColor='border'
      borderRadius='sm'
      p={1}
    >
      {modes.map(({ mode, label, icon }) => (
        <Tooltip content={label} key={mode} positioning={{ placement: 'top' }}>
          <IconButton
            aria-label={label}
            onClick={() => setTheme(mode)}
            aria-pressed={selected === mode}
            variant='toggle'
            size='xs'
          >
            <Icon as={icon} boxSize='icon.sm' />
          </IconButton>
        </Tooltip>
      ))}
    </ButtonGroup>
  )
}
