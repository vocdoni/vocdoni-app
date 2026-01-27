import { IconButton, type IconButtonProps } from '@chakra-ui/react'
import { FiPause, FiPlay, FiStopCircle, FiX } from 'react-icons/fi'

export const ActionContinue = (props: IconButtonProps) => (
  <IconButton aria-label='Continue' icon={<FiPlay />} {...props} />
)

export const ActionPause = (props: IconButtonProps) => (
  <IconButton aria-label='Pause' icon={<FiPause />} {...props} />
)

export const ActionEnd = (props: IconButtonProps) => (
  <IconButton aria-label='End' icon={<FiStopCircle />} {...props} />
)

export const ActionCancel = (props: IconButtonProps) => (
  <IconButton aria-label='Cancel' icon={<FiX />} {...props} />
)
