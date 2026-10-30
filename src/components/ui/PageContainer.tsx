import { chakra, type HTMLChakraProps, type RecipeVariantProps } from '@chakra-ui/react'
import { PageContainer as pageContainerRecipe } from '~theme/recipes/page'

export type PageContainerProps = HTMLChakraProps<'div', RecipeVariantProps<typeof pageContainerRecipe>>

/**
 * A page column: one of the content widths, centred, with the page gutters. Shells use it for their
 * header, main and footer; `asChild` lends the width and gutters to a layout element instead.
 */
export const PageContainer = chakra('div', pageContainerRecipe)

export type PageSectionProps = Omit<PageContainerProps, 'gutter'>

/** A column inside a page, narrower than the shell's: a content width without gutters of its own. */
export const PageSection = (props: PageSectionProps) => <PageContainer gutter='none' {...props} />
