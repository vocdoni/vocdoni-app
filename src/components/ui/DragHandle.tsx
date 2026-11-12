import { Box, type BoxProps, useRecipe } from '@chakra-ui/react'
import { dragHandle } from '~theme/recipes/dragHandle'

export type DragHandleProps = Omit<BoxProps, 'css'> & {
  placement: 'start' | 'center' | 'corner'
  /** Whether the item is being dragged. */
  dragging?: boolean
}

/** The grip that picks up a sortable item; spread the sortable's `attributes` and `listeners` on it. */
export const DragHandle = ({ placement, dragging, ...props }: DragHandleProps) => {
  const recipe = useRecipe({ recipe: dragHandle })

  return <Box css={recipe({ placement })} data-dragging={dragging ? '' : undefined} {...props} />
}
