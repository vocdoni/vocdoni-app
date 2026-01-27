import { ChevronDownIcon, ChevronUpIcon, CopyIcon } from '@chakra-ui/icons'
import { Box, HStack, Icon, IconButton, Link, MenuItem, MenuList, Text, useClipboard } from '@chakra-ui/react'
import { HR } from '~components/vocdoni-ui'
import { useClient } from '@vocdoni/react-providers'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaWallet } from 'react-icons/fa'
import { MdOutlineLogout } from 'react-icons/md'
import { Link as ReactRouterLink } from 'react-router-dom'
import { useDisconnect } from 'wagmi'
import { addressTextOverflow } from '~constants'
import { Routes } from '~src/router/routes'
import { LanguagesList } from './LanguagesList'

const MenuDropdown = () => {
  const { t } = useTranslation()
  const { disconnect } = useDisconnect()
  const { account, clear } = useClient()
  const { onCopy } = useClipboard(account?.address as string)

  const [isOpenMenuLanguages, setIsOpenMenuLanguages] = useState(false)

  const privacyPolicyUrl = import.meta.env.PRIVACY_POLICY_URL
  const termsOfServiceUrl = import.meta.env.TERMS_OF_SERVICE_URL

  return (
    <MenuList
      py={4}
      px={6}
      minW={{ base: '100vw', sm: 'min-content' }}
      boxShadow={{ base: '0px 10px 12px -7px gray', sm: '0px 0px 10px -3px gray' }}
      border='none'
      _hover={{
        bgColor: 'none',
      }}
    >
      {account && (
        <>
          <MenuItem
            as='div'
            display='flex'
            flexDirection='column'
            alignItems='start'
            gap={2}
            closeOnSelect={false}
            _hover={{
              bgColor: 'white',
            }}
            _active={{
              '& button': {
                outline: '2px solid transparent !important',
                bgColor: 'lightgray',
              },
            }}
            _focus={{
              '& button': {
                outline: '2px solid #8DC2ED',
              },
            }}
            onClick={() => {
              onCopy()
            }}
          >
            <Text fontWeight='bold'>{t('menu.wallet')}</Text>
            <Box display='flex' alignItems='center' gap={2}>
              <HStack justifyContent='center' bgColor='primary.main' width={8} height={8} borderRadius='50%'>
                <FaWallet size={18} color='white' />
              </HStack>
              {addressTextOverflow((account?.address as string) || '', 10)}
              <IconButton
                variant='icon'
                size='xs'
                type='button'
                icon={<CopyIcon />}
                aria-label={t('menu.copy_aria_label')}
                onClick={() => {
                  onCopy()
                }}
              />
            </Box>
          </MenuItem>

          <MenuItem as={ReactRouterLink} to={Routes.dashboard.profile}>
            {t('menu.organization')}
          </MenuItem>
        </>
      )}
      <MenuItem
        closeOnSelect={false}
        onClick={() => setIsOpenMenuLanguages((prev) => !prev)}
        display='flex'
        flexDirection='column'
        px={0}
        pb={0}
      >
        <Box as='span' px={3} display='flex' w='full' pb={2}>
          <Text>{t('menu.languages')}</Text>
          {isOpenMenuLanguages ? <ChevronUpIcon mt='5px' /> : <ChevronDownIcon mt='5px' />}
        </Box>
      </MenuItem>
      {isOpenMenuLanguages && <LanguagesList closeOnSelect={false} />}
      <MenuItem
        as={Link}
        href='https://developer.vocdoni.io/'
        target='_blank'
        _hover={{
          textDecoration: 'none',
        }}
      >
        {t('menu.documentation')}
      </MenuItem>
      <HR h={0} my={2} />
      <MenuItem
        onClick={() => {
          disconnect()
          clear()
        }}
        fontWeight='bold'
      >
        <Icon as={MdOutlineLogout} mr={1} />
        {t('menu.logout')}
      </MenuItem>
      <MenuItem fontSize='xs' color='blackAlpha.700' as={Link} href={termsOfServiceUrl} isExternal>
        {t('menu.terms')}
      </MenuItem>
      <MenuItem fontSize='xs' color='blackAlpha.700' as={Link} href={privacyPolicyUrl} isExternal>
        {t('menu.privacy')}
      </MenuItem>
    </MenuList>
  )
}

export default MenuDropdown
