import { Box, Text, useSlotRecipe, type SystemStyleObject } from '@chakra-ui/react'
import { createContext, useContext, type ReactNode } from 'react'
import { VocdoniLogo } from '~components/Layout/Logo'
import { VoterShell as voterShellRecipe } from '~theme/recipes/voterShell'

/** The measure inside the column from `lg`: the recipe's `column` variant. */
export type VoterShellColumn = 'full' | 'lead'

type VoterShellStyles = Record<string, SystemStyleObject>

// The shell's styles, resolved once per render by the shell, for the credits inside it (the foot's and the phone
// action bar's). A credit resolving the recipe on its own came out with another class in the browser than on the
// server (conformance D-23), while everything the shell styles itself hydrated cleanly.
const VoterShellStylesContext = createContext<VoterShellStyles | undefined>(undefined)

export type VoterCreditProps = {
  /** The words before the wordmark: "Votació feta amb". */
  text: string
  /** The wordmark's accessible name: "Vocdoni". */
  brand: string
  /** The terms and privacy links, after the wordmark; they wrap to a second line as one group (owner ruling R18). */
  links?: ReactNode
}

/** "Votació feta amb", the Vocdoni wordmark and the legal links: at the page's foot, or in the phone's action bar. */
export const VoterCredit = ({ text, brand, links }: VoterCreditProps) => {
  const shellStyles = useContext(VoterShellStylesContext)
  const ownStyles = useSlotRecipe({ recipe: voterShellRecipe })()
  const styles = shellStyles ?? ownStyles
  return (
    <Box as='p' css={styles.credit}>
      <Box as='span' css={styles.made}>
        {text}
        <VocdoniLogo role='img' aria-label={brand} color='fg' />
      </Box>
      {links && (
        <Box as='span' css={styles.links}>
          {links}
        </Box>
      )}
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
  /** The rail's accessible name ("Preguntes a votar"). */
  railLabel?: string
  /** The measure inside the column from `lg` (default `lead`, 560px; `full` fills the 600px column). */
  column?: VoterShellColumn
  /** The "made with Vocdoni" line and its links, at the foot (in the action bar below `md` when the page has one). */
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
    <VoterShellStylesContext.Provider value={styles}>
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
    </VoterShellStylesContext.Provider>
  )
}
