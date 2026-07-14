import { AvatarFallback, AvatarImage, AvatarRoot, Flex, FlexProps, Text, TextProps } from '@chakra-ui/react'
import { useOrganization } from '@vocdoni/react-components'
import { addressTextOverflow } from '~constants'

export const CreatedBy = (props: FlexProps) => {
  const { organization } = useOrganization()

  return (
    <Flex gap={2} alignItems='center' {...props}>
      <AvatarRoot size='xs'>
        {organization?.logo?.default ? <AvatarImage src={organization.logo.default} /> : null}
        <AvatarFallback name={organization?.name?.default} />
      </AvatarRoot>
      <LongOrganizationName size='sm' fontWeight='bold' color='texts.subtle' />
    </Flex>
  )
}

export const LongOrganizationName = (props: TextProps) => {
  const { organization } = useOrganization()

  if (!organization) return null

  const address = addressTextOverflow(organization.address)
  const name = organization.name?.default

  if (!name) {
    return <Text {...props}>{address}</Text>
  }

  return <Text {...props}>{name}</Text>
}
