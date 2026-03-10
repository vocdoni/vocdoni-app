import { AvatarFallback, AvatarImage, AvatarRoot, Flex, FlexProps, Text, TextProps } from '@chakra-ui/react'
import { enforceHexPrefix, useOrganization } from '@vocdoni/react-components'
import { addressTextOverflow } from '~constants'

export const CreatedBy = (props: FlexProps) => {
  const { organization } = useOrganization()

  return (
    <Flex gap={2} alignItems='center' {...props}>
      <AvatarRoot size='xs'>
        {organization?.account.avatar ? <AvatarImage src={organization.account.avatar} /> : null}
        <AvatarFallback name={organization?.account.name.default} />
      </AvatarRoot>
      <LongOrganizationName size='sm' fontWeight='bold' color='texts.subtle' />
    </Flex>
  )
}

export const LongOrganizationName = (props: TextProps) => {
  const { organization } = useOrganization()

  if (!organization) return null

  const { account } = organization
  const address = addressTextOverflow(enforceHexPrefix(organization.address))

  if (!account.name) {
    return <Text {...props}>{address}</Text>
  }
  const name = account.name.default

  return <Text {...props}>{name}</Text>
}
