import {
  Box,
  Button,
  Flex,
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
import { Field } from '~components/ui/Field'
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
  // Sort by language code rather than label: the labels are native names, so a
  // non-Latin script like Greek ('Ελληνικά') would always collate to the end.
  // The code ('el') keeps it within the Latin alphabet ordering instead.
  const languageEntries = Object.entries(languages).sort(([a], [b]) => a.localeCompare(b))

  return (
    <>
      {languageEntries.map(([k, label]) => {
        // Case-insensitive so a region-variant active language (e.g. 'pt-BR')
        // still matches its 'pt-br' key.
        const isSelected = k.toLowerCase() === currentLanguage?.toLowerCase()

        return (
          <MenuItem
            key={k}
            value={k}
            onClick={() => void navigateToLanguage(k)}
            closeOnSelect={closeOnSelect}
            w='full'
            display='flex'
            justifyContent='start'
            fontWeight={isSelected ? 'bold' : ''}
            bg={isSelected ? 'bg.emphasized' : undefined}
            borderRadius='none'
          >
            {label}
          </MenuItem>
        )
      })}
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
    <MenuRoot positioning={{ placement: 'bottom-end' }} onOpenChange={({ open }) => setIsOpen(open)}>
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
        <MenuContent minW={16} mt={2} maxH='15rem' overflowY='auto'>
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

const LanguageOptionLabel = ({
  label,
  isSelected,
  context,
}: {
  label: string
  isSelected: boolean
  context?: string
}) => (
  <Flex alignItems='center' gap={2} w='full' px={1}>
    {context === 'menu' && (
      <Box w='1rem' display='flex' alignItems='center' justifyContent='center'>
        {isSelected && <Icon as={LuCheck} boxSize='3' />}
      </Box>
    )}
    <Text w='full'>{label}</Text>
  </Flex>
)

export const LanguageListDashboard = ({ ...props }) => {
  const { t, i18n } = useTranslation()
  const { navigateToLanguage } = usePublicLanguageRouting()

  const languages = useLanguagesEnv()
  const languageOptions: LanguageOption[] = Object.entries(languages)
    .map(([key, label]) => ({
      value: key,
      label,
    }))
    // Sort by code, not label, so non-Latin native names (e.g. Greek 'Ελληνικά')
    // collate within the alphabet instead of being pushed to the end.
    .sort((a, b) => a.value.localeCompare(b.value))

  const selectedLanguage = languageOptions.find((opt) => opt.value === i18n.language)
  const longestLabelLength = languageOptions.reduce((max, opt) => Math.max(max, opt.label.length), 0)

  return (
    <Field
      w='full'
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      flexDir='row'
      {...props}
      label={t('form.select_language', { defaultValue: 'Language' })}
      labelProps={{ fontSize: '14px', m: '0' }}
    >
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
        formatOptionLabel={(option: LanguageOption, meta) => (
          // Compare against the active (hook) i18n language so the checkmark
          // follows in-place language switches, not the base i18n instance.
          <LanguageOptionLabel
            label={option.label}
            isSelected={option.value === i18n.language}
            context={meta.context}
          />
        )}
        chakraStyles={languagesListSelectStyles(longestLabelLength)}
      />
    </Field>
  )
}
