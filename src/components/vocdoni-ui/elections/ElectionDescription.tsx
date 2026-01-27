import { chakra, useRecipe, type HTMLChakraProps } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-providers'
import { PublishedElection } from '@vocdoni/sdk'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = HTMLChakraProps<'div'>

export const ElectionDescription = (props: Props) => {
  const { ...rest } = props
  const recipe = useRecipe({ key: 'ElectionDescription' })
  const styles = recipe()
  const { election } = useElection()
  if (!election || !(election instanceof PublishedElection)) return null
  const description = election.description?.default
  if (!description) return null
  return (
    <chakra.div css={styles} {...rest}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
    </chakra.div>
  )
}
