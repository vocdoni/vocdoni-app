import { Text, type TextProps } from '@chakra-ui/react'
import { defineComponent, type ComponentsPartialDefinition } from '@vocdoni/react-components'

export const accountComponents: ComponentsPartialDefinition = {
  AccountBalance: defineComponent<'AccountBalance', TextProps>(({ label, tone, ...props }) => {
    const color =
      tone === 'success'
        ? 'ballot.balance.success'
        : tone === 'warning'
          ? 'ballot.balance.warning'
          : 'ballot.balance.error'
    return (
      <Text color={color} {...props}>
        {label}
      </Text>
    )
  }),
}
