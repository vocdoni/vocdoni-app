import { IconButton, type IconButtonProps } from '@chakra-ui/react'
import { FiPause, FiPlay, FiStopCircle, FiX } from 'react-icons/fi'

export const ActionContinue = (props: IconButtonProps) => (
  <IconButton aria-label='Continue' {...props}>
    <FiPlay />
  </IconButton>
)

export const ActionPause = (props: IconButtonProps) => (
  <IconButton aria-label='Pause' {...props}>
    <FiPause />
  </IconButton>
)

export const ActionEnd = (props: IconButtonProps) => (
  <IconButton aria-label='End' {...props}>
    <FiStopCircle />
  </IconButton>
)

export const ActionCancel = (props: IconButtonProps) => (
  <IconButton aria-label='Cancel' {...props}>
    <FiX />
  </IconButton>
)
