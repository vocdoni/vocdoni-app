import { AspectRatio, Box, Image, useRecipe } from '@chakra-ui/react'
import { useReadMoreMarkdown } from '~components/Layout/use-read-more'
import { ElectionVideo } from '~components/Process/ElectionVideo'
import { Markdown } from '~components/ui/Markdown'
import { useVoterFlow } from '../flow-context'
import { textOf } from '../format'
import { VoterDescription } from './VoterDescription'

/**
 * What the organiser added to the vote, under the title on identify and welcome (owner ruling): the description
 * (with "read more" past 600px), the header image and the live video. Nothing when none is set.
 */
export const VoterMedia = () => {
  const { election } = useVoterFlow()
  const headerStyles = useRecipe({ key: 'ElectionHeader' })()
  const { ReadMoreMarkdownWrapper, ReadMoreMarkdownButton } = useReadMoreMarkdown(600, 20)

  const description = textOf(election.description as Parameters<typeof textOf>[0])
  const title = textOf(election.title as Parameters<typeof textOf>[0])
  if (!description && !election.header && !election.streamUri) return null

  return (
    <Box display='flex' flexDirection='column' gap='4' mt='6'>
      {election.header ? (
        <AspectRatio ratio={3 / 1} css={headerStyles}>
          <Image src={election.header} alt={title} objectFit='cover' loading='eager' fetchPriority='high' />
        </AspectRatio>
      ) : null}
      {description ? (
        <VoterDescription>
          <ReadMoreMarkdownWrapper>
            <Markdown>{description}</Markdown>
          </ReadMoreMarkdownWrapper>
          <ReadMoreMarkdownButton variant='ghost' size='sm' mt='2' />
        </VoterDescription>
      ) : null}
      <ElectionVideo streamUri={election.streamUri} title={title} />
    </Box>
  )
}
