import {
  Button,
  HStack,
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
  Text,
  useClipboard,
} from '@chakra-ui/react'
import { useOrganization } from '@vocdoni/react-components'
import { useAppEnv } from '~src/app-env'
import { getVocdoniClientConfig } from '~src/providers/vocdoni-client-config'
import { useTranslation } from 'react-i18next'
import { HiOutlineEllipsisHorizontalCircle } from 'react-icons/hi2'
import { RiExternalLinkLine, RiFileCopyLine } from 'react-icons/ri'
import { useToast } from '~components/Toast'
import { addressTextOverflow } from '~constants'

const AddressBtn = ({ ...props }) => {
  const { t } = useTranslation()
  const { organization } = useOrganization()
  const { VOCDONI_ENVIRONMENT } = useAppEnv()
  const explorerUrl = getVocdoniClientConfig(VOCDONI_ENVIRONMENT).explorerUrl ?? 'https://explorer.vote'
  const toast = useToast()
  const { copy } = useClipboard({ value: organization?.address ?? '' })

  const address = organization?.address

  return (
    <MenuRoot {...props}>
      <MenuTrigger asChild>
        <Button>
          {addressTextOverflow(address as string, 3)}
          <HiOutlineEllipsisHorizontalCircle />
        </Button>
      </MenuTrigger>
      <MenuPositioner>
        <MenuContent top='-32' left={{ md: -9 }} zIndex={30}>
          <MenuItem value='copy-address' asChild>
            <Button
              onClick={() => {
                toast({
                  title: t('copy.copied_title'),
                  duration: 3000,
                })
                copy()
              }}
              display='flex'
              justifyContent='start'
              alignItems='center'
              borderRadius='none'
              mb={1}
            >
              <RiFileCopyLine />
              {t('copy.address')}
            </Button>
          </MenuItem>

          <MenuItem value='open-explorer' asChild>
            <Button
              onClick={() => window.open(`${explorerUrl}/organization/${address}`, '_blank')}
              display='flex'
              justifyContent='start'
              alignItems='center'
              borderRadius='none'
            >
              <HStack gap={2}>
                <RiExternalLinkLine />
                <Text as='span'>{t('open_in_explorer')}</Text>
              </HStack>
            </Button>
          </MenuItem>
        </MenuContent>
      </MenuPositioner>
    </MenuRoot>
  )
}

export default AddressBtn
