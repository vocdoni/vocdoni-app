import { AspectRatio, Box, useRecipe, type HTMLChakraProps } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-components'
import { forwardRef, lazy, Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// react-player pulls in every media backend; only elections with a stream need it.
const VideoPlayer = lazy(() => import('~components/ui/VideoPlayer').then((m) => ({ default: m.VideoPlayer })))

type ElectionVideoProps = HTMLChakraProps<'div'>

export const ElectionVideo = forwardRef<HTMLDivElement, ElectionVideoProps>((props, ref) => {
  const { t } = useTranslation()
  const { election } = useElection()
  const { ...rest } = props
  const recipe = useRecipe({ key: 'ElectionVideo' })
  const styles = recipe()
  // The server renders with renderToString, where a suspended boundary is reported as an error on
  // hydration. Mounting the player after hydration keeps the server HTML and the first client render equal.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!election) return null

  const { streamUri } = election

  if (!streamUri) return null

  return (
    <Box ref={ref} css={styles} {...rest}>
      <AspectRatio ratio={16 / 9} width='full' height='full'>
        {/* The ratio box already reserves the space, so the fallback can stay empty. */}
        <Suspense fallback={null}>
          {mounted && (
            <VideoPlayer
              title={election?.title?.default || t('video.title', { defaultValue: 'Video' })}
              src={streamUri}
              width='100%'
              controls
              height='100%'
            />
          )}
        </Suspense>
      </AspectRatio>
    </Box>
  )
})
