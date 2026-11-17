import { Box, useSlotRecipe } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { PhaseList as phaseListRecipe } from '~theme/recipes/voterLists'

export type PhaseState = 'done' | 'now' | 'next'

export type PhaseListItem = {
  id: string
  /** "Autoritzant el vot", "Enviant les 4 respostes"… */
  label: ReactNode
  state: PhaseState
}

export type PhaseListProps = {
  items: PhaseListItem[]
}

/** What happens while a vote is sent, phase by phase (the sending screen); the current one carries `aria-current`. */
export const PhaseList = ({ items }: PhaseListProps) => {
  const styles = useSlotRecipe({ recipe: phaseListRecipe })()
  return (
    <Box as='ol' css={styles.root}>
      {items.map((item) => (
        <Box
          as='li'
          key={item.id}
          css={styles.item}
          data-state={item.state}
          aria-current={item.state === 'now' ? 'step' : undefined}
        >
          <Box as='span' css={styles.disc} data-state={item.state} aria-hidden />
          <Box as='span' css={styles.label}>
            {item.label}
          </Box>
        </Box>
      ))}
    </Box>
  )
}
