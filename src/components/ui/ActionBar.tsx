import { Box, useSlotRecipe } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export type ActionBarProps = {
  /** The region's accessible name ("Accions de la votació"). */
  label: string
  /** The main action (a `solid` or `off` Button at size `ballot`): it grows to share the bar's width below `md`. */
  primary?: ReactNode
  /** The way back or out ("Enrere", "Surt"), an `outline` Button at size `ballot`: it keeps its width. */
  secondary?: ReactNode
  /** A quiet line: above the buttons below `md`, after them from `md` ("Un cop emès no es pot canviar."). */
  note?: ReactNode
  /** The "made with Vocdoni" line (`VoterCredit`): shown under the buttons below `md`, where the bar covers the foot. */
  credit: ReactNode
}

/**
 * The voter page's buttons (boards V4Voter*, M4Voter*; recipe `questionDock` variant `ballot`): a bar fixed to the
 * bottom of a phone, padded for the home indicator, and a row in the flow from `md`. Inside VoterShell, the column keeps
 * clear of it and the shell's foot hides its credit below `md`.
 */
export const ActionBar = ({ label, primary, secondary, note, credit }: ActionBarProps) => {
  const styles = useSlotRecipe({ key: 'questionDock' })({ variant: 'ballot' })
  return (
    <Box as='section' aria-label={label} css={styles.root} data-scope='action-bar' data-part='root'>
      <Box css={styles.actions}>
        {secondary && <Box css={styles.secondary}>{secondary}</Box>}
        {primary && <Box css={styles.primary}>{primary}</Box>}
      </Box>
      {note && (
        <Box as='p' css={styles.note}>
          {note}
        </Box>
      )}
      <Box css={styles.credit}>{credit}</Box>
    </Box>
  )
}
