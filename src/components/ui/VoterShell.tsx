import { Box, Text, useSlotRecipe } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { VocdoniLogo } from '~components/Layout/Logo'
import { VoterShell as voterShellRecipe } from '~theme/recipes/voterShell'

/** The column's width from `lg`: the recipe's `column` variant. */
export type VoterShellColumn = 'rail' | 'narrow' | 'code' | 'sending' | 'status' | 'results'

export type VoterCreditProps = {
  /** The words before the wordmark: "Votació feta amb". */
  text: string
  /** The wordmark's accessible name: "Vocdoni". */
  brand: string
}

/** "Votació feta amb" and the Vocdoni wordmark: at the page's foot, or inside the phone's action bar. */
export const VoterCredit = ({ text, brand }: VoterCreditProps) => {
  const styles = useSlotRecipe({ recipe: voterShellRecipe })()
  return (
    <Box as='p' css={styles.credit}>
      <span>{text}</span>
      <VocdoniLogo role='img' aria-label={brand} color='fg' css={styles.wordmark} />
    </Box>
  )
}

export type VoterShellHead = {
  /** The vote's title. */
  title: ReactNode
  /** Its status line (a `Status` at size `ballot`). */
  status?: ReactNode
}

export type VoterShellProps = {
  /** The organisation's name, beside its logo or the Vocdoni symbol. */
  name: string
  /** The organisation's logo, when the vote shows it; the Vocdoni symbol otherwise. */
  logo?: ReactNode
  /** The end of the top bar: the language tag, "Surt". */
  actions?: ReactNode
  /** The vote's title and status: the strip below `lg`, the rail's head from `lg`. Only on screens with the agenda. */
  head?: VoterShellHead
  /** The step progress (ui/StepProgress), under the strip's head below `lg`. */
  progress?: ReactNode
  /** The agenda (ui/StepRail), under the rail's head from `lg`. */
  rail?: ReactNode
  /** The rail's accessible name ("Ordre del dia"). */
  railLabel?: string
  /** The column's width from `lg` (default `status`, 560px; `rail` beside the agenda). */
  column?: VoterShellColumn
  /** The "made with Vocdoni" line, at the foot (inside the action bar below `md` when the page has one). */
  credit: VoterCreditProps
  children: ReactNode
}

/**
 * The voter page's frame (boards V4Voter*, M4Voter*): top bar, the vote's strip below `lg`, the column with the agenda
 * rail from `lg`, and the credit. Holds no logic: the page passes what to show. An ActionBar inside it is kept clear of
 * and takes the credit below `md`.
 */
export const VoterShell = ({
  name,
  logo,
  actions,
  head,
  progress,
  rail,
  railLabel,
  column,
  credit,
  children,
}: VoterShellProps) => {
  const styles = useSlotRecipe({ recipe: voterShellRecipe })({ column })
  const headContent = head && (
    <>
      <Text as='span' css={styles.title}>
        {head.title}
      </Text>
      {head.status}
    </>
  )

  return (
    <Box css={styles.root} data-scope='voter-shell' data-part='root'>
      <Box as='header' css={styles.topbar}>
        <Box css={styles.brand}>{logo ?? <VocdoniLogo minimal aria-hidden color='fg' css={styles.symbol} />}</Box>
        <Text as='span' css={styles.name}>
          {name}
        </Text>
        {actions && <Box css={styles.actions}>{actions}</Box>}
      </Box>
      {head && (
        <Box css={styles.strip} data-scope='voter-shell' data-part='strip'>
          <Box css={styles.head}>{headContent}</Box>
          {progress}
        </Box>
      )}
      <Box css={styles.body}>
        {(head || rail) && (
          <Box as='aside' aria-label={railLabel} css={styles.rail} data-scope='voter-shell' data-part='rail'>
            {head && <Box css={styles.railHead}>{headContent}</Box>}
            {rail}
          </Box>
        )}
        <Box as='main' css={styles.main} data-scope='voter-shell' data-part='main'>
          {children}
        </Box>
      </Box>
      <Box as='footer' css={styles.foot} data-scope='voter-shell' data-part='foot'>
        <VoterCredit {...credit} />
      </Box>
    </Box>
  )
}
