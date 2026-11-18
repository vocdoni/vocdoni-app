import { Box, chakra, useSlotRecipe } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { ReceiptCodes as receiptCodesRecipe } from '~theme/recipes/voterLists'

export type ReceiptCode = {
  id: string
  /** The question's title. */
  title: ReactNode
  /** The full vote id; the row shows it shortened, and in full on hover. */
  voteId: string
  /** Where the voter checks this code: with it, the code is a link opening in a new tab. */
  href?: string
}

export type ReceiptCodesProps = {
  items: ReceiptCode[]
}

/** A vote id as the receipt prints it: its first and last four characters ("a3f1…9c2e"). */
export const shortVoteId = (voteId: string, keep = 4) =>
  voteId.length <= keep * 2 + 1 ? voteId : `${voteId.slice(0, keep)}…${voteId.slice(-keep)}`

/** One row per question with its shortened vote id (the receipt card's body). */
export const ReceiptCodes = ({ items }: ReceiptCodesProps) => {
  const styles = useSlotRecipe({ recipe: receiptCodesRecipe })()
  return (
    <Box as='ul' role='list' css={styles.root}>
      {items.map((item) => (
        <Box as='li' key={item.id} css={styles.row}>
          <Box as='span' css={styles.title}>
            {item.title}
          </Box>
          {item.href ? (
            <chakra.a href={item.href} target='_blank' rel='noopener noreferrer' css={styles.code} title={item.voteId}>
              {shortVoteId(item.voteId)}
            </chakra.a>
          ) : (
            <Box as='span' css={styles.code} title={item.voteId}>
              {shortVoteId(item.voteId)}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  )
}
