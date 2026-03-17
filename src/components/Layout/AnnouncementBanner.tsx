import { AlertRoot as Alert, AlertDescription, CloseButton, HStack } from '@chakra-ui/react'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useTranslation } from 'react-i18next'
import { AppEnv } from '~src/app-env'

type AnnouncementStatus = (typeof Statuses)[number]

export type AnnouncementBannerContents = {
  status: AnnouncementStatus
  message: string | Record<string, string>
  lsKey?: string
}

const Statuses = ['info', 'warning', 'success', 'error', 'neutral'] as const

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)

const isAnnouncementBannerContents = (x: unknown): x is AnnouncementBannerContents => {
  if (!isRecord(x)) return false
  if (!Statuses.includes((x as AnnouncementBannerContents).status)) return false

  const msg = (x as AnnouncementBannerContents).message
  if (typeof msg !== 'string') {
    if (!isRecord(msg)) return false
    for (const [k, v] of Object.entries(msg)) {
      if (typeof k !== 'string' || typeof v !== 'string') return false
    }
  }
  if ('lsKey' in x && typeof (x as AnnouncementBannerContents).lsKey !== 'string') return false
  return true
}

const parseAnnouncement = (raw: string | undefined): AnnouncementBannerContents | null => {
  if (!raw || !raw.trim()) return null
  try {
    const obj = JSON.parse(raw)
    if (!isAnnouncementBannerContents(obj)) {
      console.warn('[Announcement] Invalid shape. Expected { status, message, lsKey? } with status in', Statuses)
      return null
    }
    return obj
  } catch (e) {
    console.warn('[Announcement] Invalid JSON in ANNOUNCEMENT:', e)
    return null
  }
}

// Parsed once at module load:
export const Announcement: AnnouncementBannerContents | null = parseAnnouncement(AppEnv.ANNOUNCEMENT)

const AnnouncementBanner = ({ limited = false }: { limited?: boolean }) => {
  const { i18n } = useTranslation()
  const [dismissed, setDismissed] = useLocalStorage(Announcement?.lsKey || 'announcement.banner_dismissed', false)

  if (!Announcement || dismissed) return null

  const message =
    typeof Announcement.message === 'object'
      ? Announcement.message[i18n.language] || Announcement.message['en'] || null
      : Announcement.message

  if (!message) return null

  const limitStyles = {
    mx: 'auto',
    px: { base: 0, md: 6, xl: 10 },
  }

  return (
    <Alert status={Announcement.status} borderRadius={0}>
      <HStack {...(limited ? limitStyles : {})} w='full' justifyContent='space-between'>
        <AlertDescription dangerouslySetInnerHTML={{ __html: message }} />
        <CloseButton onClick={() => setDismissed(true)} />
      </HStack>
    </Alert>
  )
}

export default AnnouncementBanner
