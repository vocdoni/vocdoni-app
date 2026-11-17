import { Box, chakra, Icon, useSlotRecipe } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { CheckIcon } from '~theme/icons'
import { StepRail as stepRailRecipe } from '~theme/recipes/steps'

export type StepRailState = 'pending' | 'now' | 'done'

export type StepRailItem = {
  id: string
  /** The badge's figure: "1", "2"… A done step shows a tick instead. */
  number: string
  title: ReactNode
  state: StepRailState
  /** The answer ("Sí") or the question's state ("Tancada", "Oberta ara") under the title. */
  detail?: ReactNode
  /** Makes the row a button that goes to that step. */
  onSelect?: () => void
}

export type StepRailProps = {
  items: StepRailItem[]
}

/** The voter's numbered agenda (from `lg`, inside VoterShell's rail): to come, current (`aria-current`) and done. */
export const StepRail = ({ items }: StepRailProps) => {
  const styles = useSlotRecipe({ recipe: stepRailRecipe })()
  return (
    <Box as='ol' css={styles.root}>
      {items.map((item) => {
        const content = (
          <>
            <Box as='span' css={styles.badge} data-state={item.state} aria-hidden>
              {item.state === 'done' ? <Icon as={CheckIcon} css={styles.tick} /> : item.number}
            </Box>
            <Box as='span' css={styles.title}>
              {item.title}
            </Box>
            {item.detail && (
              <Box as='span' css={styles.detail} data-state={item.state}>
                {item.detail}
              </Box>
            )}
          </>
        )
        const current = item.state === 'now' ? 'step' : undefined
        return (
          <Box as='li' key={item.id} css={styles.item}>
            {item.onSelect ? (
              <chakra.button
                type='button'
                css={styles.row}
                data-state={item.state}
                aria-current={current}
                onClick={item.onSelect}
              >
                {content}
              </chakra.button>
            ) : (
              <Box css={styles.row} data-state={item.state} aria-current={current}>
                {content}
              </Box>
            )}
          </Box>
        )
      })}
    </Box>
  )
}
