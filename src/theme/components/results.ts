import { defineSlotRecipe } from '@chakra-ui/react'
import { resultsAnatomy } from '~components/vocdoni-ui/theming/anatomy'

const baseStyle = {
  wrapper: {
    gap: 6,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    fontWeight: 'bold',
    '& > div': {
      h: '100%',
      minH: 8,
      justifyContent: 'center',
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) auto',
      columnGap: 2,
      alignItems: 'center',
    },
  },
  header: {
    mb: 4,
  },
  choiceTitle: {
    gridColumn: '1',
    zIndex: 'sidebar',
    color: 'black',
    pl: 2,
    fontSize: 'sm',
    minW: 0,
    overflowWrap: 'break-word',
  },
  choiceVotes: {
    gridColumn: '2',
    zIndex: 'sidebar',
    display: 'flex',
    alignItems: 'center',
    pr: 2,
    fontSize: 'sm',
    color: 'black',
  },
  question: {
    width: 'full',
  },
  progress: {
    position: 'absolute',
    inset: 0,
    gridColumn: '1 / -1',
    gridRow: '1',
    alignSelf: 'stretch',
    h: '100%',
    minH: 8,
    zIndex: 'background',
    bg: 'gray.100',
    borderRadius: 'sm',
    '& > div': {
      height: '100%',
      bg: 'gray.400',
      borderRadius: 'sm',
    },
  },
}

export const ElectionResults = defineSlotRecipe({
  slots: resultsAnatomy,
  base: baseStyle,
})
