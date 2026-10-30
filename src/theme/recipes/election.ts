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
    color: 'fg.muted',
  },
})

export const ElectionVideo = defineRecipe({
  base: {
    w: 'full',
  },
})

export const ElectionTitle = defineRecipe({
  // Typography lives in the variants: a variant with a `textStyle` must not also get these from the base.
  base: {
    textAlign: 'center',
    mb: '3',
  },
  variants: {
    size: {
      md: { fontSize: 'xl', fontWeight: 'bold', lineHeight: 'short' },
      // Public process page header.
      hero: {
        textStyle: 'display',
        textAlign: 'left',
        mb: '5',
      },
      // Process page of the organization dashboard: the page title.
      page: {
        textStyle: 'page-title',
        textAlign: 'start',
      },
      // Shared-census process cards.
      card: {
        fontSize: 'lg',
        fontWeight: 'bold',
        lineHeight: 'short',
        mb: '[0]',
      },
      // One-line process rows of the organization dashboard.
      row: {
        fontSize: 'md',
        fontWeight: 'bold',
        lineHeight: 'short',
        textAlign: 'left',
        mb: '[0]',
        truncate: true,
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const ElectionQuestions = defineSlotRecipe({
  slots: questionsAnatomy,
  base: {
    title: {
      display: 'block',
      textAlign: 'start',
      lineHeight: 'short',
      fontSize: 'lg',
      fontWeight: 'semibold',
      mb: '6',
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
            mt: '10',
          },
        },
        title: {
          mb: '[0]',
        },
        stack: {
          display: 'flex',
          flexDirection: 'column',
          gap: '3',
        },
      },
      grid: {
        container: {
          '& + &': {
            mt: '10',
          },
        },
        title: {
          mb: '[0]',
        },
        stack: {
          display: 'grid',
          gridTemplateColumns: {
            base: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
          gap: '4',
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
      gap: '6',
    },
    body: {
      display: 'flex',
      flexDirection: 'column',
      gap: '3',
    },
    header: {
      mb: '4',
    },
    // The choice's title and tally, on one line above its `results` bar.
    choiceHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '4',
      mb: '1',
    },
    choiceTitle: {
      color: 'fg',
      fontSize: 'sm',
      minW: '[0]',
      overflowWrap: 'break-word',
    },
    choiceVotes: {
      color: 'fg.muted',
      fontSize: 'sm',
      whiteSpace: 'nowrap',
    },
    question: {
      width: 'full',
      minW: '[0]',
    },
  },
})

export const ElectionSchedule = defineRecipe({
  base: {
    fontWeight: 'bold',
    fontSize: 'sm',
    textAlign: 'center',
    fontStyle: 'italic',
    color: 'ballot.schedule',
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
      w: 'full',
      aspectRatio: 'landscape',
    },

    image: {
      w: 'full',
      h: 'full',
      borderTopRadius: 'lg',
      objectFit: 'cover',
      objectPosition: 'center',
    },

    // Body size on both controls: the checkbox label would otherwise pass on its smaller one.
    label: {
      textStyle: 'body',
      fontWeight: 'semibold',
      wordBreak: 'break-word',
    },

    description: {
      textStyle: 'body',
      wordBreak: 'break-word',
    },

    modalLabel: {
      textStyle: 'body',
    },

    modalDescription: {
      textStyle: 'body',
    },
  },
  variants: {
    context: {
      content: {
        wrapper: {
          gap: '2',
          height: 'full',
        },
      },
      card: {
        wrapper: {
          borderRadius: 'md',
          borderWidth: 'hairline',
          borderColor: 'ballot.choice.border',
          transition:
            '[border-color {durations.moderate} ease, box-shadow {durations.moderate} ease, background-color {durations.moderate} ease]',
          bg: 'transparent',
          p: '3',
          '&[data-state="checked"]': {
            borderColor: 'colorPalette.solid',
          },
          '&[data-disabled="true"]': {
            opacity: 'inactive',
            cursor: 'disabled',
          },
        },
      },
      plain: {
        wrapper: {
          border: '[none]',
          p: '[0]',
          bg: 'transparent',
        },
      },
    },
    layout: {
      list: {
        wrapper: {
          display: 'flex',
          alignItems: 'center',
          gap: '3',
          '& [data-choice-body]': {
            display: 'flex',
            flexDirection: 'column',
            gap: '1',
            flex: 1,
            minW: '[0]',
          },
        },
      },
      grid: {
        wrapper: {
          display: 'flex',
          flexDirection: 'column',
          height: 'full',
          position: 'relative',
          alignItems: 'start',
          w: 'full',
          p: '[0]',
          '& [data-choice-control]': {
            position: 'absolute',
            top: '2',
            right: '2',
            zIndex: 'docked',
          },
          '& [data-choice-control][data-control-type="checkbox"]': {
            borderWidth: 'hairline',
            borderColor: 'border',
            boxShadow: 'sm',
          },
          '& [data-choice-control][data-control-type="radio"]': {
            bg: 'transparent',
            border: '[none]',
            boxShadow: '[none]',
            p: '[0]',
            borderRadius: 'full',
          },
          '& [data-choice-media]': {
            width: 'full',
            display: 'block',
            overflow: 'hidden',
          },
          '& [data-choice-body]': {
            p: '4',
            display: 'flex',
            flexDirection: 'column',
            gap: '1',
            flex: 1,
            minW: '[0]',
          },
          '& [data-choice-body][data-compact]': {
            p: '[0]',
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
        mt: '4',
      },
    },
    description: {
      color: 'fg.muted',
      fontSize: 'sm',
      whiteSpace: 'pre-line',
      mb: '4',
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
      gap: '3',
      py: '6',
    },
    icon: {
      boxSize: 6,
    },
    description: {
      fontSize: 'sm',
      color: 'fg.muted',
      textAlign: 'center',
    },
  },
})

export const QuestionsTip = defineSlotRecipe({
  slots: questionTipAnatomy,
  base: {
    wrapper: {
      mt: '4',
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
      gap: '2',
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
      gap: '2',
    },
    weight: {
      fontWeight: 'bold',
    },
  },
})
