import {
  Button,
  ButtonGroup,
  ButtonGroupProps,
  HStack,
  Icon,
  IconButton,
  IconButtonProps,
  Text,
  TooltipContent,
  TooltipPositioner,
  TooltipRoot,
  TooltipTrigger,
} from '@chakra-ui/react'
import { useTheme } from 'next-themes'
import { type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { IconType } from 'react-icons'
import { IoMdMoon, IoMdSunny } from 'react-icons/io'
import { LuMonitor, LuMoon, LuSun } from 'react-icons/lu'
import { useColorMode, useColorModeValue } from '~theme/color-mode'

type ColorModeSwitcherProps = Omit<IconButtonProps, 'aria-label'>

export const ColorModeSwitcher: FC<ColorModeSwitcherProps> = (props) => {
  const { t } = useTranslation()
  const { toggleColorMode } = useColorMode()
  const text = useColorModeValue('dark', 'light')
  const SwitchIcon = useColorModeValue(IoMdMoon, IoMdSunny)

  return (
    <IconButton
      colorScheme='gray'
      onClick={toggleColorMode}
      aria-label={t('switch_mode', { defaultValue: 'Switch to {{ mode }} mode', mode: text })}
      {...props}
    >
      <SwitchIcon />
    </IconButton>
  )
}

export const ColorModeSwitcherDetailed: FC<ColorModeSwitcherProps> = (props) => {
  const { toggleColorMode } = useColorMode()
  const SwitchIcon = useColorModeValue(IoMdMoon, IoMdSunny)
  const { t } = useTranslation()
  const text = useColorModeValue(t('dark'), t('light'))

  return (
    <Button
      colorScheme='gray'
      fontSize='lg'
      onClick={toggleColorMode}
      aria-label={t('switch_mode', { defaultValue: 'Switch to {{ mode }} mode', mode: text })}
      {...props}
    >
      <HStack gap={2}>
        <SwitchIcon />
        <Text as='span'>{text}</Text>
      </HStack>
    </Button>
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
        <TooltipRoot key={mode}>
          <TooltipTrigger asChild>
            <IconButton
              aria-label={label}
              onClick={() => setTheme(mode)}
              aria-pressed={selected === mode}
              bg={selected === mode ? iconBg : undefined}
              variant='ghost'
              borderRadius='sm'
              size='xs'
            >
              <Icon as={icon} boxSize={4} />
            </IconButton>
          </TooltipTrigger>
          <TooltipPositioner>
            <TooltipContent>{label}</TooltipContent>
          </TooltipPositioner>
        </TooltipRoot>
      ))}
    </ButtonGroup>
  )
}
