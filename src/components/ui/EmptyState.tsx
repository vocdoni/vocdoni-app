import { EmptyState as ChakraEmptyState, type EmptyStateRootProps, Image, ImageProps } from '@chakra-ui/react'
import * as React from 'react'

export interface EmptyStateProps extends Omit<EmptyStateRootProps, 'title'> {
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
 * The one empty state, styled by the `emptyState` recipe: `size` sm in a table row, md in a card,
 * lg in place of a whole list.
 * Content only, no card of its own; the illustration keeps its `invert(70%)` dark treatment.
 */
export const EmptyState = ({
  icon: IconComponent,
  image,
  imageAlt,
  imageProps,
  title,
  description,
  children,
  ...rest
}: EmptyStateProps) => (
  <ChakraEmptyState.Root {...rest}>
    {IconComponent && !image && (
      <ChakraEmptyState.Indicator>
        <IconComponent />
      </ChakraEmptyState.Indicator>
    )}
    {image && <Image src={image} alt={imageAlt ?? ''} _dark={{ filter: 'invert(70%)' }} {...imageProps} />}
    {/* In a table row or search result the message is a line of text, not a section heading. */}
    <ChakraEmptyState.Title as={rest.size === 'sm' ? 'p' : undefined}>{title}</ChakraEmptyState.Title>
    {description && <ChakraEmptyState.Description>{description}</ChakraEmptyState.Description>}
    {children}
  </ChakraEmptyState.Root>
)
