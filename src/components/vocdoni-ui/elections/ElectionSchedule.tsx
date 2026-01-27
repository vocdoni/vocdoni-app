import { Heading, type HeadingProps } from '@chakra-ui/react'

export type ElectionScheduleProps = HeadingProps & {
  format?: string
  showRemaining?: boolean
  showCreatedAt?: boolean
}

export const ElectionSchedule = (props: ElectionScheduleProps) => <Heading as='h2' size='sm' {...props} />
