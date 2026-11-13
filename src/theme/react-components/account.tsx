import { Text, type TextProps } from '@chakra-ui/react'
import { defineComponent, type ComponentsPartialDefinition } from '@vocdoni/react-components'

export const accountComponents: ComponentsPartialDefinition = {
  AccountBalance: defineComponent<'AccountBalance', TextProps>(({ label, tone, ...props }) => {
    // A literal `color` next to a spread of all the style props overflows TypeScript (TS2590), so it is typed once and spread.
    const toneStyle: TextProps = {
      color:
        tone === 'success'
          ? 'ballot.balance.success'
          : tone === 'warning'
            ? 'ballot.balance.warning'
            : 'ballot.balance.error',
    }
    return (
      <Text {...toneStyle} {...(props as TextProps)}>
        {label}
      </Text>
    )
  }),
}
