import { Box, Text, useSlotRecipe } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export type QuestionDockProps = {
  /** "3. Quotes 2027". */
  title: string
  /** "Open, 172 votes", "To open"; nothing when the board has only a time the API does not keep. */
  note?: string
  /** The question's buttons (the same ones as its row). */
  children: ReactNode
}

/** Styles for the page around the bar, so its content stays clear of it (recipe `questionDock`). */
export const useQuestionDockPage = () => useSlotRecipe({ key: 'questionDock' })().page

/**
 * The phone's bottom bar of a question-by-question vote (M4VoteOne): what is being run and its buttons, always at
 * hand. A labelled region, so a screen reader can jump to it.
 */
export const QuestionDock = ({ title, note, children }: QuestionDockProps) => {
  const { t } = useTranslation()
  const styles = useSlotRecipe({ key: 'questionDock' })()
  return (
    <Box
      as='section'
      aria-label={t('votes.summary.dock.label', { defaultValue: 'Vote controls' })}
      data-scope='question-dock'
      data-part='root'
      css={styles.root}
    >
      <Box css={styles.line}>
        <Text as='span' css={styles.title}>
          {title}
        </Text>
        {note && (
          <Text as='span' css={styles.note}>
            {note}
          </Text>
        )}
      </Box>
      <Box css={styles.actions}>{children}</Box>
    </Box>
  )
}
