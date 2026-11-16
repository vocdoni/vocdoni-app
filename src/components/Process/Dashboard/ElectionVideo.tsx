import { AspectRatio, Box, useRecipe, type HTMLChakraProps } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-components'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { VideoPlayer } from '~components/ui/VideoPlayer'

type ElectionVideoProps = HTMLChakraProps<'div'>

export const ElectionVideo = forwardRef<HTMLDivElement, ElectionVideoProps>((props, ref) => {
  const { t } = useTranslation()
  const { election } = useElection()
  const { ...rest } = props
  const recipe = useRecipe({ key: 'ElectionVideo' })
  const styles = recipe()

  if (!election) return null

  const { streamUri } = election

  if (!streamUri) return null

  return (
    <Box ref={ref} css={styles} {...rest}>
      <AspectRatio ratio={16 / 9} width='full' height='full'>
        <VideoPlayer
          title={election?.title?.default || t('video.title', { defaultValue: 'Video' })}
          src={streamUri}
          width='100%'
          controls
          height='100%'
        />
      </AspectRatio>
    </Box>
  )
})
