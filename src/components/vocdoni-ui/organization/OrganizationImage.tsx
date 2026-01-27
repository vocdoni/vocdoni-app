import { Image, useStyleConfig, type ImageProps } from '@chakra-ui/react'
import { useOrganization } from '@vocdoni/react-providers'

export type OrganizationImageProps = ImageProps & { gateway?: string }

export const OrganizationImage = ({ gateway, ...props }: OrganizationImageProps) => {
  const styles = useStyleConfig('OrganizationImage', props)
  const { organization } = useOrganization()
  let avatar = organization?.account.avatar
  if (!avatar) {
    avatar = organization?.account.logo
  }
  return <Image src={avatar} sx={styles} {...props} />
}
