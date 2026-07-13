import { Box, BoxProps, Icon, Image, ImageProps, Text } from '@chakra-ui/react'
import * as React from 'react'

export interface EmptyStateProps extends Omit<BoxProps, 'title'> {
  /** Lucide/react-icons component for compact, in-list empty states. */
  icon?: React.ElementType
  /** Illustration source for full-page empty states. Mutually exclusive with `icon`. */
  image?: string
  imageAlt?: string
  imageProps?: ImageProps
  title: React.ReactNode
  description?: React.ReactNode
  /** Optional call-to-action (button/link) rendered below the description. */
  children?: React.ReactNode
}

/**
 * Standard empty/zero state: an icon or illustration, a bold title, subtle description,
 * and an optional CTA. Replaces the near-identical `NoElections` / `NoOrganizations` /
 * `NoResultsFiltering` cards and the hand-rolled `UsersEmpty` in Team.tsx.
 *
 * Renders content only (no card) so it works both inside a surface (the `no-elections`
 * card) and standalone in a list. The illustration keeps the existing `invert(70%)` dark
 * treatment; replacing those PNGs with proper dark assets is tracked separately.
 */
export const EmptyState = ({
  icon,
  image,
  imageAlt,
  imageProps,
  title,
  description,
  children,
  ...rest
}: EmptyStateProps) => (
  <Box display='flex' flexDirection='column' alignItems='center' textAlign='center' gap={3} {...rest}>
    {icon && <Icon as={icon} boxSize={12} color='fg.muted' />}
    {image && <Image src={image} alt={imageAlt} _dark={{ filter: 'invert(70%)' }} {...imageProps} />}
    <Text fontWeight='bold' fontSize='lg'>
      {title}
    </Text>
    {description && <Text color='fg.muted'>{description}</Text>}
    {children}
  </Box>
)
