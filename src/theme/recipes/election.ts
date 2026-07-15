import { defineRecipe, defineSlotRecipe } from '@chakra-ui/react'
import {
  questionChoiceAnatomy,
  questionsAnatomy,
  questionsConfirmationAnatomy,
  questionsEmptyAnatomy,
  questionTipAnatomy,
  questionTypeBadgeAnatomy,
  resultsAnatomy,
  votedAnatomy,
  voteWeightAnatomy,
} from '~theme/react-components/anatomy/election'

export const ElectionDescription = defineRecipe({
  base: {
    color: 'texts.subtle',
  },
})

export const ElectionVideo = defineRecipe({
  base: {
    w: 'full',
  },
})

export const ElectionTitle = defineRecipe({
  base: {
    fontWeight: 'bold',
    fontSize: 'xl',
    textAlign: 'center',
    lineHeight: 1.3,
    mb: 3,
  },
})

export const ElectionQuestions = defineSlotRecipe({
  slots: questionsAnatomy,
  base: {
    title: {
      display: 'block',
      textAlign: 'start',
      lineHeight: 1.3,
      fontSize: 'lg',
      fontWeight: 'semibold',
      mb: 6,
    },
    body: {
      width: 'full',
    },

    error: {
      display: 'flex',
      justifyContent: 'center',
    },
  },
  variants: {
    layout: {
      list: {
        container: {
          '& + &': {
            mt: 10,
          },
        },
        title: {
          mb: 0,
        },
        stack: {
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        },
      },
      grid: {
        container: {
          '& + &': {
            mt: 10,
          },
        },
        title: {
          mb: 0,
        },
        stack: {
          display: 'grid',
          gridTemplateColumns: {
            base: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 4,
        },
      },
    },
  },
  defaultVariants: {
    layout: 'list',
  },
})

export const ElectionResults = defineSlotRecipe({
  slots: resultsAnatomy,
  base: {
    wrapper: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      alignItems: 'start',
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
      color: 'fg',
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
      color: 'fg',
    },
    question: {
      width: 'full',
      minW: 0,
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
    },
  },
})

const resultsProgressBarAnatomy = ['root', 'track', 'range'] as const

export const resultsProgressRecipe = defineSlotRecipe({
  slots: resultsProgressBarAnatomy,
  base: {
    root: {
      h: '100%',
      minH: 8,
      borderRadius: 'sm',
      overflow: 'hidden',
    },
    track: {
      h: '100%',
      bg: { base: 'gray.100', _dark: 'gray.800' },
      borderRadius: 'inherit',
    },
    range: {
      h: '100%',
      bg: { base: 'gray.400', _dark: 'gray.500' },
      borderRadius: 'inherit',
    },
  },
})

export const ElectionSchedule = defineRecipe({
  base: {
    fontWeight: 'bold',
    fontSize: 'sm',
    textAlign: 'center',
    fontStyle: 'italic',
    color: 'gray.400',
  },
})

export const QuestionChoice = defineSlotRecipe({
  slots: questionChoiceAnatomy,
  base: {
    wrapper: {
      '& [data-choice-control]': {
        flexShrink: 0,
      },
    },

    skeleton: {
      w: '100%',
      aspectRatio: '4 / 3',
    },

    image: {
      w: '100%',
      h: '100%',
      borderTopRadius: 'lg',
      objectFit: 'cover',
      objectPosition: 'center',
    },

    label: {
      fontWeight: 'semibold',
      wordBreak: 'break-word',
    },

    description: {
      wordBreak: 'break-word',
    },
  },
  variants: {
    context: {
      content: {
        wrapper: {
          gap: 2,
          height: '100%',
        },
      },
      card: {
        wrapper: {
          borderRadius: 'md',
          borderWidth: '1px',
          borderColor: 'gray.200',
          _dark: { borderColor: 'brand.700' },
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
          bg: 'transparent',
          p: 3,
          '&[data-state="checked"]': {
            borderColor: 'black',
            _dark: { borderColor: 'white' },
          },
          '&[data-disabled="true"]': {
            opacity: 0.6,
            cursor: 'not-allowed',
          },
        },
      },
      plain: {
        wrapper: {
          border: 'none',
          p: 0,
          bg: 'transparent',
        },
      },
    },
    layout: {
      list: {
        wrapper: {
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          '& [data-choice-body]': {
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            flex: 1,
            minW: 0,
          },
        },
      },
      grid: {
        wrapper: {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
          alignItems: 'start',
          w: 'full',
          p: 0,
          '& [data-choice-control]': {
            position: 'absolute',
            top: 2,
            right: 2,
            zIndex: 'docked',
          },
          '& [data-choice-control][data-control-type="checkbox"]': {
            borderWidth: '1px',
            borderColor: 'table.border',
            boxShadow: 'sm',
          },
          '& [data-choice-control][data-control-type="radio"]': {
            bg: 'transparent',
            border: 'none',
            boxShadow: 'none',
            p: 0,
            borderRadius: 'full',
          },
          '& [data-choice-media]': {
            width: '100%',
            display: 'block',
            overflow: 'hidden',
          },
          '& [data-choice-body]': {
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            flex: 1,
            minW: 0,
          },
          '& [data-choice-body][data-compact]': {
            p: 0,
          },
        },
      },
    },
  },
  defaultVariants: {
    context: 'content',
  },
})

export const QuestionsConfirmation = defineSlotRecipe({
  slots: questionsConfirmationAnatomy,
  base: {
    question: {
      '& + &': {
        mt: 4,
      },
    },
    description: {
      color: 'texts.subtle',
      fontSize: 'sm',
      whiteSpace: 'pre-line',
      mb: 4,
    },
    title: {
      fontWeight: 'bold',
    },
  },
})

export const QuestionsEmpty = defineSlotRecipe({
  slots: questionsEmptyAnatomy,
  base: {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3,
      py: 6,
    },
    icon: {
      boxSize: 6,
    },
    description: {
      fontSize: 'sm',
      color: 'texts.subtle',
      textAlign: 'center',
    },
  },
})

export const QuestionsTip = defineSlotRecipe({
  slots: questionTipAnatomy,
  base: {
    wrapper: {
      mt: 4,
      w: 'full',
      display: 'flex',
      justifyContent: 'end',
      alignItems: 'end',
    },
    text: {
      fontSize: 'sm',
      fontWeight: 'semibold',
    },
  },
})

export const QuestionsTypeBadge = defineSlotRecipe({
  slots: questionTypeBadgeAnatomy,
  base: {
    box: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    },
    title: {
      fontWeight: 'bold',
    },
    tooltip: {},
  },
})

export const Voted = defineSlotRecipe({
  slots: votedAnatomy,
  base: {
    description: {
      '& > a': {
        wordBreak: 'break-word',
      },
    },
  },
})

export const VoteWeight = defineSlotRecipe({
  slots: voteWeightAnatomy,
  base: {
    wrapper: {
      display: 'flex',
      gap: 2,
    },
    weight: {
      fontWeight: 'bold',
    },
  },
})
