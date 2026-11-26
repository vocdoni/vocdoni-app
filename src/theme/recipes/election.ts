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
import { link } from './typography'

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
        mb: '0',
      },
      // One-line process rows of the organization dashboard.
      row: {
        fontSize: 'md',
        fontWeight: 'bold',
        lineHeight: 'short',
        textAlign: 'left',
        mb: '0',
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
      lineHeight: 'question',
      fontSize: 'ballot.question',
      fontWeight: 'semibold',
      letterSpacing: 'heading.question',
      mb: '6',
    },
    description: {
      fontSize: 'lg',
      letterSpacing: 'voter',
      color: 'fg.muted',
      mb: '4',
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
          mb: '0',
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
          mb: '0',
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
      fontWeight: 'medium',
      minW: '0',
      overflowWrap: 'break-word',
    },
    // The tally string carries the percentage, so the whole line takes the figure face.
    choiceVotes: {
      textStyle: 'figure',
      color: 'fg.muted',
      fontSize: 'sm',
      whiteSpace: 'nowrap',
    },
    question: {
      width: 'full',
      minW: '0',
    },
    // One choice of a result. In a final result with a clear leader that row carries `data-leading` (a medium
    // figure) and the others `data-dimmed` (their bar at 0.4). It is highlighted, never called the winner: the
    // organisation decides how many options win. Live, provisional or tied results set neither.
    choice: {
      '&[data-dimmed] [data-scope="progress"][data-part="root"]': {
        opacity: '[0.4]',
      },
      '&[data-leading] [data-result-figure]': {
        fontWeight: 'medium',
      },
    },
  },
})

export const ElectionSchedule = defineRecipe({
  base: {
    fontWeight: 'normal',
    fontSize: 'sm',
    textAlign: 'center',
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
      borderTopRadius: 'xl',
      objectFit: 'cover',
      objectPosition: 'center',
    },

    // The option label is larger than body text and medium; the chosen one turns semibold (see `context`).
    // Set on both controls: the checkbox label would otherwise pass on its smaller one.
    label: {
      fontSize: 'ballot.option',
      lineHeight: 'short',
      fontWeight: 'medium',
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
          // The minimum height keeps a one-line option as tall as before; the padding gives a wrapped one room.
          minH: '16',
          py: '3',
          px: '4.5',
          borderRadius: 'xl',
          borderWidth: 'hairline',
          borderColor: 'ballot.choice.border',
          transition:
            '[border-color {durations.moderate} ease, box-shadow {durations.moderate} ease, background-color {durations.moderate} ease]',
          bg: 'bg.panel',
          // A second 1px ring of the border's colour: the choice reads 2px without moving the layout.
          '&[data-state="checked"]': {
            borderColor: 'colorPalette.solid',
            boxShadow: '[0 0 0 1px {colors.colorPalette.solid}]',
            bg: 'accent.subtle',
            '& [data-choice-label]': { fontWeight: 'semibold' },
          },
          '& [data-choice-control][data-control-type="checkbox"]': {
            boxSize: 'icon.lg',
            borderRadius: 'xs',
            borderWidth: 'mark',
            borderColor: 'ballot.choice.ring',
            bg: 'transparent',
            '&[data-state="checked"]': {
              borderColor: 'colorPalette.solid',
              bg: 'colorPalette.solid',
              color: 'accent.contrast',
            },
          },
          '&:has(input:focus-visible)': {
            outlineWidth: '{borderWidths.focusRing}',
            outlineStyle: 'solid',
            outlineColor: 'colorPalette.focusRing',
            outlineOffset: '{spacing.0.5}',
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
          p: '0',
          bg: 'transparent',
        },
      },
    },
    layout: {
      list: {
        wrapper: {
          display: 'flex',
          alignItems: 'center',
          gap: '3.5',
          '& [data-choice-body]': {
            display: 'flex',
            flexDirection: 'column',
            gap: '1',
            flex: 1,
            minW: '0',
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
          p: '0',
          '& [data-choice-control]': {
            position: 'absolute',
            top: '2',
            right: '2',
            zIndex: 'docked',
          },
          '& [data-choice-control][data-control-type="checkbox"]': {
            borderWidth: 'hairline',
            borderColor: 'border',
            bg: 'bg.panel',
          },
          '& [data-choice-control][data-control-type="radio"]': {
            bg: 'transparent',
            border: '[none]',
            boxShadow: '[none]',
            p: '0',
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
            minW: '0',
          },
          '& [data-choice-body][data-compact]': {
            p: '0',
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
      fontWeight: 'semibold',
    },
    // The same success disc as `Voted`, at the size of a card's title line.
    check: {
      boxSize: '5',
      mt: '0.5',
      flexShrink: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'full',
      bg: 'status.success.fg',
      color: 'accent.contrast',
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
      color: 'fg.subtle',
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
      fontSize: 'lg',
      letterSpacing: 'voter',
      color: 'fg.subtle',
    },
  },
})

export const QuestionsTypeBadge = defineSlotRecipe({
  slots: questionTypeBadgeAnatomy,
  base: {
    // A ringed tag, never a filled pill.
    box: {
      display: 'inline-flex',
      alignItems: 'center',
      w: '[fit-content]',
      px: '1.5',
      borderWidth: 'hairline',
      borderColor: 'border.emphasized',
      borderRadius: 'xs',
    },
    title: {
      fontSize: 'xs',
      fontWeight: 'medium',
      lineHeight: 'moderate',
      color: 'fg.subtle',
    },
    tooltip: {},
  },
})

export const Voted = defineSlotRecipe({
  slots: votedAnatomy,
  base: {
    // No coloured panel: the green is the disc alone.
    container: {
      bg: 'transparent',
      borderColor: 'border',
      color: 'fg',
      gap: '3',
    },
    // Fil's done disc: a filled disc in the success ink with a white tick.
    icon: {
      boxSize: 'control.floating',
      borderRadius: 'full',
      bg: 'status.success.fg',
      color: 'accent.contrast',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '& svg': { boxSize: '6' },
    },
    title: {
      fontSize: 'xl',
      fontWeight: 'semibold',
      color: 'fg',
    },
    description: {
      color: 'fg',
      // Without an explorer the vote id is plain text, so the line has to wrap it on a phone.
      overflowWrap: 'anywhere',
      // The vote id is a bare <a> inside each line's <p>, so it takes the `link` recipe's base.
      '& a': {
        ...link.base,
        wordBreak: 'break-all',
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
      fontWeight: 'semibold',
    },
  },
})
