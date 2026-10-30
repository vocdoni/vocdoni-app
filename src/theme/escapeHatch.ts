import type { SystemContext } from '@chakra-ui/react'

const ESCAPED = /^\[([^[\]]+)\]$/

// `strictTokens` types `[value]` as the way out for non-design values (`0`, `auto`), but Chakra 3.x never
// unwraps it and emits the invalid `padding: [0]`. Token references inside it, like `{sizes.8}`, still expand.
export const withEscapeHatch = <T extends SystemContext>(system: T): T => {
  const expand = system.tokens.expandReferenceInValue
  system.tokens.expandReferenceInValue = (value) => {
    const inner = ESCAPED.exec(value)?.[1]
    return expand(inner ?? value)
  }
  return system
}
