import { IoLogoWhatsapp } from 'react-icons/io'
import ShareButton, { ShareButtonProps } from '~components/Share/ShareButton'
import objectToGetParams, { getBrowserUserAgent } from '~components/Share/utils'

// THX https://github.com/nygardk/react-share/blob/master/src/WhatsappShareButton.ts

function isMobileOrTablet() {
  return /(android|iphone|ipad|mobile)/i.test(getBrowserUserAgent())
}

function whatsappLink(url: string, { title, separator }: { title?: string; separator?: string }) {
  return (
    'https://' +
    (isMobileOrTablet() ? 'api' : 'web') +
    '.whatsapp.com/send' +
    objectToGetParams({
      text: title ? title + separator + url : url,
    })
  )
}

const WhatsappShare = ({ url, caption, ...rest }: ShareButtonProps) => {
  const whatsapp = whatsappLink(url, { title: caption, separator: ' - ' })
  return <ShareButton shareUrl={whatsapp} icon={IoLogoWhatsapp} network={'whatsapp'} {...rest} />
}

export default WhatsappShare
