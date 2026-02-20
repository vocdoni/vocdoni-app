import { Image, useRecipe, type ImageProps } from '@chakra-ui/react'
import { useOrganization } from '@vocdoni/react-providers'
import { linkifyIpfs } from '../primitives/ipfs'

export type OrganizationImageProps = ImageProps & {
  gateway?: string
  size?: string
  variant?: string
  fallbackSrc?: string
}

export const OrganizationImage = ({ gateway, fallbackSrc, ...props }: OrganizationImageProps) => {
  const { size, variant, ...rest } = props
  const recipe = useRecipe({ key: 'OrganizationImage' })
  const styles = recipe({ size, variant })
  const { organization } = useOrganization()
  let avatar = organization?.account.avatar
  if (!avatar) {
    avatar = organization?.account.logo
  }
  const src = linkifyIpfs(avatar, gateway) || fallbackSrc
  return <Image src={src} css={styles} {...rest} />
}
