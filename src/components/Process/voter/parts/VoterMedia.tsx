import { AspectRatio, Box, Image, useRecipe } from '@chakra-ui/react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useReadMoreMarkdown } from '~components/Layout/use-read-more'
import { Markdown } from '~components/ui/Markdown'
import { useVoterFlow } from '../flow-context'
import { textOf } from '../format'

// react-player pulls in every media backend; only votes with a stream need it.
const VideoPlayer = lazy(() => import('~components/ui/VideoPlayer').then((module) => ({ default: module.VideoPlayer })))

/**
 * What the organiser added to the vote, under the title on identify and welcome (owner ruling): the description
 * (with "read more" past 600px), the header image and the live video. Nothing when none is set.
 */
export const VoterMedia = () => {
  const { t } = useTranslation()
  const { election } = useVoterFlow()
  const videoStyles = useRecipe({ key: 'ElectionVideo' })()
  const { ReadMoreMarkdownWrapper, ReadMoreMarkdownButton } = useReadMoreMarkdown(600, 20)
  // The player mounts after hydration: the server renders with renderToString, where a suspended lazy boundary
  // would mismatch the first client render.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const description = textOf(election.description as Parameters<typeof textOf>[0])
  const title = textOf(election.title as Parameters<typeof textOf>[0])
  if (!description && !election.header && !election.streamUri) return null

  return (
    <Box display='flex' flexDirection='column' gap='4' mt='6'>
      {election.header ? (
        <AspectRatio ratio={3 / 1} w='full' borderRadius='xl' overflow='hidden'>
          <Image src={election.header} alt={title} objectFit='cover' loading='eager' fetchPriority='high' />
        </AspectRatio>
      ) : null}
      {description ? (
        <Box textStyle='ballot-body' color='fg.muted'>
          <ReadMoreMarkdownWrapper>
            <Markdown>{description}</Markdown>
          </ReadMoreMarkdownWrapper>
          <ReadMoreMarkdownButton variant='ghost' size='sm' mt='2' />
        </Box>
      ) : null}
      {election.streamUri ? (
        <Box css={videoStyles}>
          <AspectRatio ratio={16 / 9} w='full'>
            <Suspense fallback={null}>
              {mounted && (
                <VideoPlayer
                  title={title || t('video.title', { defaultValue: 'Video' })}
                  src={election.streamUri}
                  width='100%'
                  height='100%'
                  controls
                />
              )}
            </Suspense>
          </AspectRatio>
        </Box>
      ) : null}
    </Box>
  )
}
