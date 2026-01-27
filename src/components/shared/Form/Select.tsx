import { Select as ChakraSelect } from 'chakra-react-select'
import { forwardRef } from 'react'
import { selectStyles } from '~theme/selectStyles'

export const Select = forwardRef<any, any>(function Select(props, ref) {
  const { chakraStyles, ...rest } = props
  return <ChakraSelect ref={ref} chakraStyles={{ ...selectStyles, ...chakraStyles }} {...rest} />
})
