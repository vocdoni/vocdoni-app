import { chakra, useStyleConfig, type ChakraProps } from '@chakra-ui/react'
import { useOrganization } from '@vocdoni/react-providers'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = ChakraProps

export const OrganizationDescription = (props: Props) => {
  const styles = useStyleConfig('OrganizationDescription', props)
  const { organization } = useOrganization()
  if (!organization) return null
  if (!organization.account.description) return null
  return (
    <chakra.div __css={styles} {...props}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{organization.account.description.default}</ReactMarkdown>
    </chakra.div>
  )
}
