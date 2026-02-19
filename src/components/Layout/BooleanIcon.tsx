import { Icon } from '@chakra-ui/react'
import { LuCheck, LuX } from 'react-icons/lu'

export const BooleanIcon = ({ value, ...props }) => (
  <Icon as={value ? LuCheck : LuX} color={value ? 'green.500' : 'red.500'} fontSize='md' {...props} />
)
