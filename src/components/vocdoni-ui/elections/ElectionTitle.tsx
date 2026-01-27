import { chakra, useRecipe, type HTMLChakraProps } from '@chakra-ui/react'
import { forwardRef } from 'react'
import { useElection } from '@vocdoni/react-providers'
import { PublishedElection } from '@vocdoni/sdk'

type ElectionTitleProps = HTMLChakraProps<'h1'>

export const ElectionTitle = forwardRef<HTMLHeadingElement, ElectionTitleProps>((props, ref) => {
  const { election } = useElection()
  const { ...rest } = props
  const recipe = useRecipe({ key: 'ElectionTitle' })
  const styles = recipe()
  if (!election) return null
  const title = election instanceof PublishedElection ? election.title?.default : election.id
  return (
    <chakra.h1 ref={ref} title={title} css={styles} {...rest}>
      {title}
    </chakra.h1>
  )
})

ElectionTitle.displayName = 'ElectionTitle'
