import { Box, chakra, useClipboard, useSlotRecipe, type SystemStyleObject } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'
import { CopyIcon } from '~theme/icons'
import { ReceiptCodes as receiptCodesRecipe } from '~theme/recipes/voterLists'

export type ReceiptCode = {
  id: string
  /** The question's title. */
  title: string
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

/** A code with no page to check it on: a button that copies the full vote id, named by the code it shows and its question. */
const CopyCode = ({ voteId, question, css }: { voteId: string; question: string; css: SystemStyleObject }) => {
  const { t } = useTranslation()
  const toast = useToast()
  const { copy } = useClipboard({ value: voteId })
  const code = shortVoteId(voteId)
  return (
    <chakra.button
      type='button'
      css={css}
      title={voteId}
      aria-label={t('voter.receipt.copy_code', {
        code,
        question,
        defaultValue: '{{code}}: copy the full code of {{question}}',
      })}
      onClick={() => {
        toast({ title: t('copy.copied_title'), duration: 3000 })
        copy()
      }}
    >
      <CopyIcon />
      {code}
    </chakra.button>
  )
}

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
            <CopyCode voteId={item.voteId} question={item.title} css={styles.code} />
          )}
        </Box>
      ))}
    </Box>
  )
}
