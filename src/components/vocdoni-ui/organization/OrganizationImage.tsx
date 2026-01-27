import { Image, type ImageProps } from '@chakra-ui/react'

export type OrganizationImageProps = ImageProps & { gateway?: string }

export const OrganizationImage = ({ gateway, ...props }: OrganizationImageProps) => <Image {...props} />
