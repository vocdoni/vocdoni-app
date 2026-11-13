import Cal, { getCalApi } from '@calcom/embed-react'
import { Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppEnv } from '~src/app-env'
import { useColorMode } from '~theme/color-mode'

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
      cal('ui', { hideEventTypeDetails: false, layout: 'month_view', theme: colorMode })
      cal('on', {
        action: 'bookingSuccessfulV2',
        callback,
      })
    })()
  }, [])

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
