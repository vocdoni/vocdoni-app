import { Text, type TextProps } from '@chakra-ui/react'
import { defineComponent, type ComponentsPartialDefinition } from '@vocdoni/react-components'

export const accountComponents: ComponentsPartialDefinition = {
  AccountBalance: defineComponent<'AccountBalance', TextProps>(({ label, tone, ...props }) => {
    const color = tone === 'success' ? 'green.500' : tone === 'warning' ? 'orange.500' : 'red.500'
    return (
      <Text color={color} {...props}>
        {label}
      </Text>
    )
  }),
}
