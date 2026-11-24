import { defineRecipe } from '@chakra-ui/react'
import { figureMark } from './figureMark'

// A numbered step in a small disc (the census' two parts): the number centred by its ink, a ring in the step's tone,
// filled with a tick once done. Decorative; the words next to it carry the status.
export const StepMark = defineRecipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSize: '4.5',
    flexShrink: 0,
    // Sits the disc on the first line of the label beside it.
    mt: 'mark',
    borderRadius: 'full',
    borderWidth: 'mark',
    fontSize: 'xs',
    fontWeight: 'bold',
    ...figureMark,
  },
  variants: {
    status: {
      idle: { borderColor: 'border.emphasized', color: 'fg.muted' },
      current: { colorPalette: 'warning', borderColor: 'colorPalette.solid', color: 'colorPalette.fg' },
      error: { colorPalette: 'danger', borderColor: 'colorPalette.solid', color: 'colorPalette.fg' },
      done: {
        colorPalette: 'success',
        borderColor: 'colorPalette.solid',
        bg: 'colorPalette.solid',
        color: 'colorPalette.contrast',
      },
    },
  },
  defaultVariants: { status: 'idle' },
})
