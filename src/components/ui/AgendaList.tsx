import { Box, useSlotRecipe } from '@chakra-ui/react'
import { useId, type ReactNode } from 'react'
import { AgendaList as agendaListRecipe } from '~theme/recipes/voterLists'

export type AgendaListItem = {
  id: string
  /** "1", "2"… */
  number: string
  title: ReactNode
  /** A quiet line under the title. */
  note?: ReactNode
}

export type AgendaListProps = {
  /** The list's label and accessible name: "Ordre del dia", "La següent". */
  label: string
  items: AgendaListItem[]
}

/** The questions of a vote as a ruled list (the welcome screen), or the next one when none is open. */
export const AgendaList = ({ label, items }: AgendaListProps) => {
  const styles = useSlotRecipe({ recipe: agendaListRecipe })()
  const labelId = useId()
  return (
    <Box css={styles.root}>
      <Box as='span' id={labelId} css={styles.label}>
        {label}
      </Box>
      <Box as='ol' css={styles.list} aria-labelledby={labelId}>
        {items.map((item) => (
          <Box as='li' key={item.id} css={styles.item}>
            <Box as='span' css={styles.number} aria-hidden>
              {item.number}
            </Box>
            <Box as='span' css={styles.body}>
              <span>{item.title}</span>
              {item.note && (
                <Box as='span' css={styles.note}>
                  {item.note}
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
