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
      // Cast to the spread's own types: literals beside a spread of all the style props overflow TypeScript (TS2590).
      <Text color={color as TextProps['color']} {...(props as TextProps)}>
        {label}
      </Text>
    )
  }),
}
