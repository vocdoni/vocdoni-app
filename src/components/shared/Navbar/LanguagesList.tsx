import {
  AccordionItem,
  AccordionItemBody,
  AccordionItemContent,
  AccordionItemIndicator,
  AccordionItemTrigger,
  AccordionRoot,
  Box,
  Button,
  Flex,
  FieldRoot as FormControl,
  FieldLabel as FormLabel,
  HStack,
  Icon,
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { FaGlobeAmericas } from 'react-icons/fa'
import { LuCheck } from 'react-icons/lu'
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri'
import i18n from '~i18n'
import { Select } from '~shared/Form/Select'
import { languagesListSelectStyles } from '~theme/selectStyles'

export const LanguagesList = ({ closeOnSelect }: { closeOnSelect: boolean }) => {
  const { i18n } = useTranslation()

  const languages = import.meta.env.LANGUAGES as Record<string, string>
  const languageEntries = Object.entries(languages).sort(([, a], [, b]) => a.localeCompare(b))

  return (
    <>
      {languageEntries.map(([k]) => (
        <MenuItem
          key={k}
          value={k}
          onClick={() => {
            i18n.changeLanguage(k)
          }}
          closeOnSelect={closeOnSelect}
          w='full'
          display='flex'
          justifyContent={closeOnSelect ? 'center' : 'start'}
          fontWeight={k === i18n.language ? 'bold' : ''}
          borderRadius='none'
        >
          {k.toUpperCase()}
        </MenuItem>
      ))}
    </>
  )
}

export const LanguagesMenu = ({ ...props }) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const languages = import.meta.env.LANGUAGES as Record<string, string>
  const hasMultipleLanguages = Object.keys(languages).length > 1
  if (!hasMultipleLanguages) {
    return null
  }

  return (
    <MenuRoot onOpenChange={({ open }) => setIsOpen(open)}>
      <MenuTrigger asChild>
        <Button aria-label={t('menu.burger_aria_label')} variant='solid' colorScheme='gray' minW='none' {...props}>
          <HStack gap={1}>
            <FaGlobeAmericas />
            {isOpen ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
          </HStack>
        </Button>
      </MenuTrigger>
      <MenuPositioner>
        <MenuContent minW={16} mt={2}>
          <LanguagesList closeOnSelect={true} />
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

  const languages = import.meta.env.LANGUAGES as Record<string, string>
  const languageOptions: LanguageOption[] = Object.entries(languages)
    .map(([key, label]) => ({
      value: key,
      label,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  const selectedLanguage = languageOptions.find((opt) => opt.value === i18n.language)

  return (
    <FormControl w='full' display='flex' justifyContent='space-between' alignItems='center' {...props}>
      <FormLabel fontSize={'14px'} m='0'>
        {t('form.select_language', { defaultValue: 'Language' })}
      </FormLabel>

      <Select
        options={languageOptions}
        value={selectedLanguage}
        onChange={(option: LanguageOption | null) => {
          if (option) {
            i18n.changeLanguage(option.value)
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

export const LanguagesListAccordion = () => {
  const { i18n } = useTranslation()

  const languages = import.meta.env.LANGUAGES as Record<string, string>
  const languageEntries = Object.entries(languages).sort(([, a], [, b]) => a.localeCompare(b))

  // Check if there's only one language
  const hasMultipleLanguages = Object.keys(languages).length > 1

  // Only render if there are multiple languages
  if (!hasMultipleLanguages) {
    return null
  }

  return (
    <AccordionRoot multiple m={0} p={0} borderColor='transparent'>
      <AccordionItem value='languages'>
        <AccordionItemTrigger asChild>
          <Button
            m={0}
            p={0}
            h='fit-content'
            display='flex'
            alignItems='center'
            justifyContent='start'
            fontSize='md'
            bg='none'
          >
            <HStack gap={2} w='full' justifyContent='space-between'>
              <HStack gap={2}>
                <FaGlobeAmericas />
                <Text as='span'>
                  <Trans i18nKey='languages'>Languages</Trans>
                </Text>
              </HStack>
              <AccordionItemIndicator />
            </HStack>
          </Button>
        </AccordionItemTrigger>
        <AccordionItemContent>
          <AccordionItemBody pb={0}>
            <Stack direction={{ base: 'column', md: 'row' }} gap={2} mt={2}>
              {languageEntries.map(([k, lang]) => (
                <Button
                  key={k}
                  onClick={() => {
                    i18n.changeLanguage(k)
                  }}
                  display='flex'
                  data-active={k === i18n.language ? '' : undefined}
                  p={2}
                  h='fit-content'
                >
                  {lang}
                </Button>
              ))}
            </Stack>
          </AccordionItemBody>
        </AccordionItemContent>
      </AccordionItem>
    </AccordionRoot>
  )
}

export default LanguagesListAccordion
