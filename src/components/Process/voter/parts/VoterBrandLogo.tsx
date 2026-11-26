import { Image } from '@chakra-ui/react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { VocdoniLogo } from '~components/Layout/Logo'

/**
 * The organisation's logo in the voter's top bar, when the brand shows one (`data.brand`, resolved on the server).
 * A logo that fails to load gives way to the Vocdoni symbol, as the app's header does.
 */
export const VoterBrandLogo = ({ src, name }: { src: string; name: string }) => {
  const { t } = useTranslation()
  const [failed, setFailed] = useState<string>()
  // The image ships in the server markup and may fail before hydration, with no listener yet: replay it on mount.
  const replay = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth === 0) node.setAttribute('src', node.src)
  }, [])
  if (failed === src) return <VocdoniLogo minimal aria-hidden color='fg' h='ballot.symbol' w='auto' />
  return (
    <Image
      ref={replay}
      src={src}
      alt={
        name
          ? t('alt.images.org_logo', { defaultValue: '{{org}} logo', org: name })
          : t('alt.images.organization_logo', { defaultValue: 'Organization logo' })
      }
      h='ballot.logo'
      w='auto'
      maxW='32'
      objectFit='contain'
      onError={() => setFailed(src)}
    />
  )
}
