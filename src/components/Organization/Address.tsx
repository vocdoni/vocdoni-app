import {
  Button,
  Flex,
  HStack,
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
  Text,
  useClipboard,
} from '@chakra-ui/react'
import { enforceHexPrefix, useClient, useOrganization } from '@vocdoni/react-providers'
import { useTranslation } from 'react-i18next'
import { HiOutlineEllipsisHorizontalCircle } from 'react-icons/hi2'
import { RiExternalLinkLine, RiFileCopyLine } from 'react-icons/ri'
import { addressTextOverflow } from '~constants'
import { useToast } from '~shared/Toast'

const AddressBtn = ({ ...props }) => {
  const { t } = useTranslation()
  const { organization } = useOrganization()
  const { client } = useClient()
  const toast = useToast()
  const { copy } = useClipboard({ value: organization?.address ?? '' })

  const address = enforceHexPrefix(organization?.address)

  return (
    <MenuRoot {...props}>
      <MenuTrigger asChild>
        <Button>
          <Flex alignItems='center' gap={4}>
            <Text truncate>{addressTextOverflow(address as string, 3)}</Text>
            <HiOutlineEllipsisHorizontalCircle />
          </Flex>
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
              <HStack gap={2}>
                <RiFileCopyLine />
                <Text as='span'>{t('copy.address')}</Text>
              </HStack>
            </Button>
          </MenuItem>

          <MenuItem value='open-explorer' asChild>
            <Button
              onClick={() => window.open(`${client.explorerUrl}/organization/${address}`, '_blank')}
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
