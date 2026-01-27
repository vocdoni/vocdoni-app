import { chakra, useStyleConfig, type ChakraProps } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-providers'
import { PublishedElection } from '@vocdoni/sdk'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = ChakraProps

export const ElectionDescription = (props: Props) => {
  const styles = useStyleConfig('ElectionDescription', props)
  const { election } = useElection()
  if (!election || !(election instanceof PublishedElection)) return null
  const description = election.description?.default
  if (!description) return null
  return (
    <chakra.div __css={styles} {...props}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
    </chakra.div>
  )
}
