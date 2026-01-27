import { Box, HStack, Icon, IconButton, Link, MenuContent, MenuItem, Text, useClipboard } from '@chakra-ui/react'
import { useClient } from '@vocdoni/react-providers'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaWallet } from 'react-icons/fa'
import { MdOutlineLogout } from 'react-icons/md'
import { RiArrowDownSLine, RiArrowUpSLine, RiFileCopyLine } from 'react-icons/ri'
import { Link as ReactRouterLink } from 'react-router-dom'
import { useDisconnect } from 'wagmi'
import { HR } from '~components/vocdoni-ui'
import { addressTextOverflow } from '~constants'
import { Routes } from '~src/router/routes'
import { LanguagesList } from './LanguagesList'

const MenuDropdown = () => {
  const { t } = useTranslation()
  const { disconnect } = useDisconnect()
  const { account, clear } = useClient()
  const { copy } = useClipboard({ value: account?.address ?? '' })

  const [isOpenMenuLanguages, setIsOpenMenuLanguages] = useState(false)

  const privacyPolicyUrl = import.meta.env.PRIVACY_POLICY_URL
  const termsOfServiceUrl = import.meta.env.TERMS_OF_SERVICE_URL

  return (
    <MenuContent
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
            value='wallet'
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
              copy()
            }}
          >
            <Text fontWeight='bold'>{t('menu.wallet')}</Text>
            <Box display='flex' alignItems='center' gap={2}>
              <HStack justifyContent='center' bgColor='primary.main' width={8} height={8} borderRadius='50%'>
                <FaWallet size={18} color='white' />
              </HStack>
              {addressTextOverflow((account?.address as string) || '', 10)}
              <IconButton
                size='xs'
                type='button'
                aria-label={t('menu.copy_aria_label')}
                onClick={() => {
                  copy()
                }}
              >
                <RiFileCopyLine />
              </IconButton>
            </Box>
          </MenuItem>

          <MenuItem value='organization' asChild>
            <ReactRouterLink to={Routes.dashboard.profile}>{t('menu.organization')}</ReactRouterLink>
          </MenuItem>
        </>
      )}
      <MenuItem
        value='languages-toggle'
        closeOnSelect={false}
        onClick={() => setIsOpenMenuLanguages((prev) => !prev)}
        display='flex'
        flexDirection='column'
        px={0}
        pb={0}
      >
        <Box as='span' px={3} display='flex' w='full' pb={2}>
          <Text>{t('menu.languages')}</Text>
          {isOpenMenuLanguages ? <Icon as={RiArrowUpSLine} mt='5px' /> : <Icon as={RiArrowDownSLine} mt='5px' />}
        </Box>
      </MenuItem>
      {isOpenMenuLanguages && <LanguagesList closeOnSelect={false} />}
      <MenuItem value='documentation' asChild>
        <Link
          href='https://developer.vocdoni.io/'
          target='_blank'
          _hover={{
            textDecoration: 'none',
          }}
        >
          {t('menu.documentation')}
        </Link>
      </MenuItem>
      <HR h={0} my={2} />
      <MenuItem
        value='logout'
        onClick={() => {
          disconnect()
          clear()
        }}
        fontWeight='bold'
      >
        <Icon as={MdOutlineLogout} mr={1} />
        {t('menu.logout')}
      </MenuItem>
      <MenuItem value='terms' asChild>
        <Link fontSize='xs' color='blackAlpha.700' href={termsOfServiceUrl} target='_blank' rel='noopener noreferrer'>
          {t('menu.terms')}
        </Link>
      </MenuItem>
      <MenuItem value='privacy' asChild>
        <Link fontSize='xs' color='blackAlpha.700' href={privacyPolicyUrl} target='_blank' rel='noopener noreferrer'>
          {t('menu.privacy')}
        </Link>
      </MenuItem>
    </MenuContent>
  )
}

export default MenuDropdown
