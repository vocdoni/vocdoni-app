import { chakra, forwardRef, useMultiStyleConfig, type HeadingProps } from '@chakra-ui/react'
import { useDatesLocale, useElection, useLocalize } from '@vocdoni/react-providers'
import { ElectionStatus, PublishedElection } from '@vocdoni/sdk'
import { format, formatDistance } from 'date-fns'

export type ElectionScheduleProps = HeadingProps & {
  format?: string
  showRemaining?: boolean
  showCreatedAt?: boolean
}

export const ElectionSchedule = forwardRef<ElectionScheduleProps, 'h2'>(
  ({ format: formatPattern = 'PPp', showRemaining = false, showCreatedAt = false, ...rest }, ref) => {
    const styles = useMultiStyleConfig('ElectionSchedule', rest)
    const { election } = useElection()
    const locale = useDatesLocale()
    const t = useLocalize()
    if (!election || !(election instanceof PublishedElection)) return null

    const getRemaining = () => {
      const endDate = election.endDate
      const startDate = election.startDate
      switch (election.status) {
        case ElectionStatus.ONGOING:
        case ElectionStatus.RESULTS: {
          if (endDate < new Date()) {
            return t('schedule.ended', {
              distance: formatDistance(endDate, new Date(), { addSuffix: true, locale }),
            })
          }
          return formatDistance(endDate, new Date(), { addSuffix: true, locale })
        }
        case ElectionStatus.ENDED:
          return t('schedule.ended', {
            distance: formatDistance(endDate, new Date(), { addSuffix: true, locale }),
          })
        case ElectionStatus.PAUSED:
          if (new Date() < startDate) {
            return t('schedule.paused_start', {
              distance: formatDistance(startDate, new Date(), { addSuffix: true, locale }),
            })
          }
          return t('schedule.paused_end', {
            distance: formatDistance(endDate, new Date(), { addSuffix: true, locale }),
          })
        case ElectionStatus.UPCOMING:
        default:
          return formatDistance(startDate, new Date(), { addSuffix: true, locale })
      }
    }

    let text = t('schedule.from_begin_to_end', {
      begin: format(new Date(election.startDate), formatPattern, { locale }),
      end: format(new Date(election.endDate), formatPattern, { locale }),
    })
    if (showRemaining) {
      text = getRemaining()
    } else if (showCreatedAt) {
      text = t('schedule.created', {
        distance: formatDistance(election.creationTime, new Date(), { addSuffix: true, locale }),
      })
    }

    return (
      <chakra.h2 ref={ref} __css={styles} {...rest}>
        {text}
      </chakra.h2>
    )
  }
)

ElectionSchedule.displayName = 'ElectionSchedule'
