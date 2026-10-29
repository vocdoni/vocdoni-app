import { Icon } from '@chakra-ui/react'
import { LuCheck, LuX } from 'react-icons/lu'

export const BooleanIcon = ({ value, ...props }) => (
  <Icon
    as={value ? LuCheck : LuX}
    color={value ? 'status.success.alt.500' : 'status.error.alt.500'}
    fontSize='md'
    {...props}
  />
)
