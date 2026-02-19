import { useEffect } from 'react'
import { Crisp } from 'crisp-sdk-web'

const CrispChat = () => {
  const websiteId = import.meta.env.CRISP_WEBSITE_ID

  useEffect(() => {
    if (!websiteId || typeof window === 'undefined') {
      return
    }

    const typedWindow = window as typeof window & { $crisp?: unknown }
    if (typedWindow.$crisp) {
      return
    }

    Crisp.configure(websiteId)
  }, [websiteId])

  return null
}

export default CrispChat
