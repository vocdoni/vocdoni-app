import { chakra, useRecipe, type HTMLChakraProps } from '@chakra-ui/react'
import { useOrganization } from '@vocdoni/react-providers'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = HTMLChakraProps<'div'> & { size?: string; variant?: string }

export const OrganizationDescription = (props: Props) => {
  const { size, variant, ...rest } = props
  const recipe = useRecipe({ key: 'OrganizationDescription' })
  const styles = recipe({ size, variant })
  const { organization } = useOrganization()
  if (!organization) return null
  if (!organization.account.description) return null
  return (
    <chakra.div css={styles} {...rest}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{organization.account.description.default}</ReactMarkdown>
    </chakra.div>
  )
}
