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
import { explorerOrganizationUrl } from '@vocdoni/api-client'
import { getVocdoniClientConfig } from '~src/providers/vocdoni-client-config'
import { useTranslation } from 'react-i18next'
import { CopyIcon, ExternalLinkIcon, MoreIcon } from '~theme/icons'
import { useToast } from '~components/Toast'
import { addressTextOverflow } from '~constants'

const AddressBtn = ({ ...props }) => {
  const { t } = useTranslation()
  const { organization } = useOrganization()
  const { VOCDONI_ENVIRONMENT } = useAppEnv()
  const { clientEnv } = getVocdoniClientConfig(VOCDONI_ENVIRONMENT)
  const toast = useToast()
  const { copy } = useClipboard({ value: organization?.address ?? '' })

  const address = organization?.address
  const explorerOrganization = explorerOrganizationUrl(clientEnv, address ?? '')

  return (
    <MenuRoot {...props}>
      <MenuTrigger asChild>
        <Button>
          {addressTextOverflow(address as string, 3)}
          <MoreIcon />
        </Button>
      </MenuTrigger>
      <MenuPositioner>
        <MenuContent top='-32' left={{ md: '-9' }} zIndex='dropdown'>
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
              borderRadius='sm'
              mb='1'
            >
              <CopyIcon />
              {t('copy.address')}
            </Button>
          </MenuItem>

          <MenuItem value='open-explorer' disabled={!explorerOrganization} asChild>
            <Button
              onClick={() => window.open(explorerOrganization, '_blank')}
              display='flex'
              justifyContent='start'
              alignItems='center'
              borderRadius='sm'
            >
              <HStack gap='2'>
                <ExternalLinkIcon />
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
