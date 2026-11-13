import { Box, type BoxProps, useRecipe } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { dragHandle } from '~theme/recipes/dragHandle'

export type DragHandleProps = Omit<BoxProps, 'css'> & {
  placement: 'start' | 'center' | 'corner'
  /** Whether the item is being dragged. */
  dragging?: boolean
}

/** The grip that picks up a sortable item; spread the sortable's `attributes` and `listeners` on it. */
export const DragHandle = ({ placement, dragging, ...props }: DragHandleProps) => {
  const { t } = useTranslation()
  const recipe = useRecipe({ recipe: dragHandle })

  return (
    <Box
      css={recipe({ placement })}
      data-dragging={dragging ? '' : undefined}
      // The grip is icon-only, so the sortable's role=button would have no name; callers may override it
      aria-label={t('drag_handle.label', { defaultValue: 'Drag to reorder' })}
      {...props}
    />
  )
}
