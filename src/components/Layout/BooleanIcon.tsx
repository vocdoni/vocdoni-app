import { Icon } from '@chakra-ui/react'
import { CheckIcon, CloseIcon } from '~theme/icons'

export const BooleanIcon = ({ value, ...props }) => (
  <Icon
    as={value ? CheckIcon : CloseIcon}
    color={value ? 'status.success.fg' : 'status.error.fg'}
    fontSize='md'
    {...props}
  />
)
