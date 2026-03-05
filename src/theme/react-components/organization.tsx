import {
  Box,
  Heading,
  Image,
  Text,
  useRecipe,
  type BoxProps,
  type HeadingProps,
  type ImageProps,
  type TextProps,
} from '@chakra-ui/react'
import { defineComponent, type ComponentsPartialDefinition } from '@vocdoni/react-components'
import { Markdown } from '~components/ui/Markdown'

export const organizationComponents: ComponentsPartialDefinition = {
  OrganizationName: defineComponent<'OrganizationName', HeadingProps>(({ name, ...props }) => {
    const recipe = useRecipe({ key: 'OrganizationName' })
    const styles = recipe()
    return (
      <Heading as='h2' css={styles} {...props}>
        {name}
      </Heading>
    )
  }),
  OrganizationDescription: defineComponent<'OrganizationDescription', BoxProps>(({ description, ...props }) => {
    const recipe = useRecipe({ key: 'OrganizationDescription' })
    const styles = recipe()
    return (
      <Box css={styles} {...props}>
        <Markdown>{description}</Markdown>
      </Box>
    )
  }),
  OrganizationAvatar: defineComponent<'OrganizationAvatar', ImageProps>(({ src, alt, ...props }) => {
    const recipe = useRecipe({ key: 'OrganizationImage' })
    const styles = recipe()
    if (!src) {
      return <Image css={styles} src='https://api.dicebear.com/6.x/shapes/svg' alt={alt} {...props} />
    }

    return <Image css={styles} src={src} alt={alt} {...props} />
  }),
  QuestionsError: defineComponent<'QuestionsError', TextProps>(({ error, variant: _variant, ...props }) => (
    <Text color='red.500' {...props}>
      {error}
    </Text>
  )),
}
