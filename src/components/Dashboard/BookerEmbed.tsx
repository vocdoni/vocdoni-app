import Cal, { getCalApi } from '@calcom/embed-react'
import { Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppEnv } from '~src/app-env'
import { useColorMode } from '~theme/color-mode'
import { EMBED_DARK, embedBrandColor } from '~theme/embedColors'

export type BookerProps = {
  callback?: () => void
}

const Booker = ({ callback }: BookerProps) => {
  const { colorMode } = useColorMode()
  const { t } = useTranslation()
  const appEnv = useAppEnv()

  useEffect(() => {
    ;(async function () {
      const cal = await getCalApi({ namespace: '30min' })
      cal('on', {
        action: 'bookingSuccessfulV2',
        callback,
      })
    })()
  }, [])

  // Re-sent on every mode change so an open booker follows it. Cal sits in a dialog, so dark paints the dialog grey.
  useEffect(() => {
    ;(async function () {
      const cal = await getCalApi({ namespace: '30min' })
      cal('ui', {
        hideEventTypeDetails: false,
        layout: 'month_view',
        theme: colorMode,
        cssVarsPerTheme: {
          light: {},
          dark: {
            'cal-bg': EMBED_DARK.dialog,
            'cal-text': EMBED_DARK.text,
            'cal-border': EMBED_DARK.fieldRing,
            'cal-brand': embedBrandColor(appEnv.PRIMARY_COLOR),
          },
        },
      })
    })()
  }, [colorMode])

  if (!appEnv.CALCOM_EVENT_SLUG) {
    return (
      <Text>
        {t('booking.unavailable', {
          defaultValue: 'Booking is currently unavailable. Please try again later.',
        })}
      </Text>
    )
  }

  return (
    <Cal
      namespace='30min'
      calLink={appEnv.CALCOM_EVENT_SLUG}
      style={{ width: '100%', height: '100%', overflow: 'scroll' }}
      config={{ layout: 'month_view' }}
    />
  )
}

export default Booker
