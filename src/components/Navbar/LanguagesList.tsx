import {
  Box,
  Button,
  Flex,
  FieldRoot as FormControl,
  FieldLabel as FormLabel,
  Icon,
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
  Text,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaGlobeAmericas } from 'react-icons/fa'
import { LuCheck } from 'react-icons/lu'
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri'
import { Select } from '~components/Form/Select'
import i18n from '~i18n'
import { navigateToPublicLanguage, usePublicLanguageRouting } from '~i18n/usePublicLanguageRouting'
import { useLanguagesEnv } from '~src/app-env'
import { languagesListSelectStyles } from '~theme/selectStyles'

export const navigateToLanguage = (
  language: string,
  i18n: ReturnType<typeof useTranslation>['i18n'],
  supportedLanguages: string[],
  publicLanguageLinks?: Record<string, string>,
  navigate: (url: string) => void = (url) => window.location.assign(url)
) => {
  void navigateToPublicLanguage({
    language,
    supportedLanguages,
    publicLanguageLinks,
    navigate,
    changeLanguage: i18n.changeLanguage.bind(i18n),
  })
}

export const LanguagesList = ({
  closeOnSelect,
  publicLanguageLinks,
}: {
  closeOnSelect: boolean
  publicLanguageLinks?: Record<string, string>
}) => {
  const { navigateToLanguage, currentLanguage } = usePublicLanguageRouting({ publicLanguageLinks })

  const languages = useLanguagesEnv()
  const languageEntries = Object.entries(languages).sort(([, a], [, b]) => a.localeCompare(b))

  return (
    <>
      {languageEntries.map(([k]) => (
        <MenuItem
          key={k}
          value={k}
          onClick={() => void navigateToLanguage(k)}
          closeOnSelect={closeOnSelect}
          w='full'
          display='flex'
          justifyContent={closeOnSelect ? 'center' : 'start'}
          fontWeight={k === currentLanguage ? 'bold' : ''}
          borderRadius='none'
        >
          {k.toUpperCase()}
        </MenuItem>
      ))}
    </>
  )
}

export const LanguagesMenu = ({ publicLanguageLinks, ...props }: { publicLanguageLinks?: Record<string, string> }) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const languages = useLanguagesEnv()
  const hasMultipleLanguages = Object.keys(languages).length > 1
  if (!hasMultipleLanguages) {
    return null
  }

  return (
    <MenuRoot onOpenChange={({ open }) => setIsOpen(open)}>
      <MenuTrigger asChild>
        <Button
          aria-label={t('menu.burger_aria_label')}
          variant='subtle'
          colorPalette='gray'
          minW='none'
          gap={1}
          {...props}
        >
          <Icon as={FaGlobeAmericas} />
          {isOpen ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
        </Button>
      </MenuTrigger>
      <MenuPositioner>
        <MenuContent minW={16} mt={2}>
          <LanguagesList closeOnSelect={true} publicLanguageLinks={publicLanguageLinks} />
        </MenuContent>
      </MenuPositioner>
    </MenuRoot>
  )
}
interface LanguageOption {
  value: string
  label: string
}

const LanguageOptionLabel = ({ value, label }, { context }) => {
  const isSelected = value === i18n.language

  return (
    <Flex alignItems='center' gap={2} w='full' px={1}>
      {context === 'menu' && (
        <Box w='1rem' display='flex' alignItems='center' justifyContent='center'>
          {isSelected && <Icon as={LuCheck} boxSize='3' />}
        </Box>
      )}
      <Text w='full'>{label}</Text>
    </Flex>
  )
}

export const LanguageListDashboard = ({ ...props }) => {
  const { t, i18n } = useTranslation()
  const { navigateToLanguage } = usePublicLanguageRouting()

  const languages = useLanguagesEnv()
  const languageOptions: LanguageOption[] = Object.entries(languages)
    .map(([key, label]) => ({
      value: key,
      label,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  const selectedLanguage = languageOptions.find((opt) => opt.value === i18n.language)

  return (
    <FormControl w='full' display='flex' justifyContent='space-between' alignItems='center' flexDir='row' {...props}>
      <FormLabel fontSize={'14px'} m='0'>
        {t('form.select_language', { defaultValue: 'Language' })}
      </FormLabel>

      <Select
        options={languageOptions}
        value={selectedLanguage}
        onChange={(option: LanguageOption | null) => {
          if (option) {
            void navigateToLanguage(option.value)
          }
        }}
        isClearable={false}
        isSearchable={false}
        size='sm'
        placeholder={t('form.choose_an_option', { defaultValue: 'Choose an option' })}
        menuPlacement='top'
        formatOptionLabel={LanguageOptionLabel}
        chakraStyles={languagesListSelectStyles}
      />
    </FormControl>
  )
}
