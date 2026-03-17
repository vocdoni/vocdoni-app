import { FaTwitter } from 'react-icons/fa'
import ShareButton, { ShareButtonProps } from '~components/Share/ShareButton'
import { getBrowserHref } from '~components/Share/utils'

const TwitterShare = ({ url, caption, ...rest }: ShareButtonProps) => {
  const linked = encodeURIComponent(`${caption} — ${getBrowserHref()}`)
  const twitter = `https://twitter.com/intent/tweet?text=${linked}`

  return <ShareButton shareUrl={twitter} icon={FaTwitter} network={'twitter'} {...rest} />
}

export default TwitterShare
