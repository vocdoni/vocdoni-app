import { Box, Progress } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useNavigation } from 'react-router'

/**
 * A thin accent bar at the top of the content area while the router loads the next page, which
 * keeps the current one on screen until then. It fades in after a short delay, so navigations
 * that resolve at once never flash it.
 */
export const NavigationPendingBar = () => {
  const { t } = useTranslation()
  const { state } = useNavigation()

  if (state === 'idle') return null

  return (
    // Zero-height sticky anchor: the bar stays at the top of the viewport over a scrolled page.
    <Box position='sticky' top='0' h='0' zIndex='sticky'>
      <Progress.Root
        value={null}
        aria-label={t('loading')}
        position='absolute'
        top='0'
        insetX='0'
        animationName='fade-in'
        animationDuration='moderate'
        animationDelay='fast'
        animationFillMode='backwards'
      >
        <Progress.Track h='0.5' bg='transparent'>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    </Box>
  )
}
