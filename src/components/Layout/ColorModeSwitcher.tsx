import { ButtonGroup, ButtonGroupProps, Icon, IconButton, IconButtonProps } from '@chakra-ui/react'
import { useTheme } from 'next-themes'
import { type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { IconType } from 'react-icons'
import { IoMdMoon, IoMdSunny } from 'react-icons/io'
import { LuMonitor, LuMoon, LuSun } from 'react-icons/lu'
import { Tooltip } from '~components/ui/Tooltip'
import { useColorMode, useColorModeValue } from '~theme/color-mode'

type ColorModeSwitcherProps = Omit<IconButtonProps, 'aria-label'>

export const ColorModeSwitcher: FC<ColorModeSwitcherProps> = (props) => {
  const { t } = useTranslation()
  const { toggleColorMode } = useColorMode()
  const text = useColorModeValue('dark', 'light')
  const SwitchIcon = useColorModeValue(IoMdMoon, IoMdSunny)

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

  const iconBg = useColorModeValue('gray.100', 'gray.700')

  const modes: { mode: Mode; label: string; icon: IconType }[] = [
    { mode: 'system', label: t('system', 'System'), icon: LuMonitor },
    { mode: 'light', label: t('light', 'Light'), icon: LuSun },
    { mode: 'dark', label: t('dark', 'Dark'), icon: LuMoon },
  ]

  return (
    <ButtonGroup
      variant='outline'
      aria-label={t('color_mode_switcher', 'Color mode switcher')}
      {...props}
      border='1px solid'
      borderColor='table.border'
      borderRadius='sm'
      p={1}
    >
      {modes.map(({ mode, label, icon }) => (
        <Tooltip content={label} key={mode} positioning={{ placement: 'top' }}>
          <IconButton
            aria-label={label}
            onClick={() => setTheme(mode)}
            aria-pressed={selected === mode}
            bg={selected === mode ? iconBg : undefined}
            variant='ghost'
            // Concentric with the group: outer `sm` (6px) − `p={1}` (4px) padding = 2px (`xxs`).
            borderRadius='xxs'
            size='xs'
          >
            <Icon as={icon} boxSize={4} />
          </IconButton>
        </Tooltip>
      ))}
    </ButtonGroup>
  )
}
