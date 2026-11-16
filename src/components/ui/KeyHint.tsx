import { Kbd, type KbdProps } from '@chakra-ui/react'

/** A shortcut printed next to its control. Decorative: the control itself carries `aria-keyshortcuts`. */
export const KeyHint = (props: Omit<KbdProps, 'variant' | 'size'>) => <Kbd aria-hidden {...props} />
