import { Box, useSlotRecipe } from '@chakra-ui/react'
import { cloneElement, isValidElement, useId, type ReactNode } from 'react'

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
  /** The main action reads the note too, for a note that explains the action rather than being another action. */
  noteDescribesPrimary?: boolean
}

/**
 * The voter page's buttons (boards V4Voter*, M4Voter*; recipe `questionDock` variant `ballot`): a bar fixed to the
 * bottom of a phone, padded for the home indicator, and a row in the flow from `md`. Inside VoterShell, the column keeps
 * clear of it and the shell's foot hides its credit below `md`.
 */
export const ActionBar = ({
  label,
  primary,
  secondary,
  note,
  credit,
  noteDescribesPrimary = false,
}: ActionBarProps) => {
  const styles = useSlotRecipe({ key: 'questionDock' })({ variant: 'ballot' })
  const noteId = useId()
  // A note that explains the action is read with it, whatever the order on screen: the note follows the buttons in the
  // DOM.
  const described =
    note && noteDescribesPrimary && isValidElement<{ 'aria-describedby'?: string }>(primary)
      ? cloneElement(primary, {
          'aria-describedby': [primary.props['aria-describedby'], noteId].filter(Boolean).join(' '),
        })
      : primary
  return (
    <Box as='section' aria-label={label} css={styles.root} data-scope='action-bar' data-part='root'>
      <Box css={styles.actions}>
        {secondary && <Box css={styles.secondary}>{secondary}</Box>}
        {described && (
          <Box css={styles.primary} data-part='primary'>
            {described}
          </Box>
        )}
      </Box>
      {/* A block, not a paragraph: a block a screen puts in the note never lands in a `p` (conformance D-19). */}
      {note && (
        <Box id={noteId} css={styles.note}>
          {note}
        </Box>
      )}
      <Box css={styles.credit}>{credit}</Box>
    </Box>
  )
}
