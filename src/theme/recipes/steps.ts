import { defineSlotRecipe } from '@chakra-ui/react'
import { figureMark } from './figureMark'
import { touchTarget } from './touchTarget'

// The voter's numbered agenda beside the column from `lg` (ui/StepRail, board V4VoterWide). Each row is a 24px badge
// and the question's title, with its answer or state under it; `data-state` on the row and its badge is `pending`,
// `now`, `done`, `skipped` or `more`. A step still to come rings its number in the track grey, the current one fills it with the vote's
// colour (edged when that colour is too pale for the page) and turns the row semibold in ink, a done one is an ink
// disc with a tick and a muted row, a skipped one (a question that closed without the voter's vote) rings its number
// in the quiet ink, and a fold row ("+4") draws its count at 11px. A row the voter can jump to is a button.
export const StepRail = defineSlotRecipe({
  slots: ['root', 'item', 'row', 'badge', 'tick', 'title', 'detail'],
  base: {
    root: { display: 'flex', flexDirection: 'column', listStyleType: 'none', m: '0', p: '0' },
    item: { display: 'block' },
    row: {
      display: 'grid',
      gridTemplateColumns: '[{sizes.6} minmax(0, 1fr)]',
      columnGap: '3',
      w: 'full',
      py: 'step',
      textAlign: 'start',
      textStyle: 'ballot-hint',
      color: 'fg.subtle',
      '&[data-state=done]': { color: 'fg.muted' },
      '&[data-state=now]': { color: 'fg', fontWeight: 'semibold' },
      '&:is(button)': {
        ...touchTarget,
        cursor: 'button',
        borderRadius: 'sm',
        focusVisibleRing: 'outside',
        focusRingColor: 'colorPalette.focusRing',
        _hover: { color: 'fg' },
      },
    },
    badge: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSize: '6',
      borderRadius: 'full',
      textStyle: 'ballot-figure',
      ...figureMark,
      fontWeight: 'normal',
      boxShadow: 'shadow.mark',
      // Forced colours drop the ring's box shadow, so a pending badge would vanish; its border keeps the shape.
      _highContrast: { borderWidth: 'mark' },
      '&[data-state=done]': { bg: 'bg.inverted', color: 'fg.inverted', boxShadow: '[none]' },
      '&[data-state=now]': {
        bg: 'accent.solid',
        color: 'accent.contrast',
        boxShadow: 'shadow.edge.inner',
        fontWeight: 'semibold',
      },
      '&[data-state=skipped]': {
        boxShadow: '[inset 0 0 0 {borderWidths.mark} {colors.fg.subtle}]',
        color: 'fg.muted',
      },
      '&[data-state=more]': { textStyle: 'ballot-figure-fold', lineHeight: figureMark.lineHeight },
    },
    tick: { boxSize: '3.5' },
    title: { gridColumn: '2', minW: '0' },
    detail: {
      gridColumn: '2',
      textStyle: 'control',
      color: 'fg.subtle',
    },
  },
})

// The voter's step progress in the strip below `lg` (ui/StepProgress, v148): the label ("Pregunta 2 de 4") 12px under
// the vote's head, and the 3px line (Progress `line`) on the strip's bottom rule, centred on it (1px above, 1px below).
export const StepProgress = defineSlotRecipe({
  slots: ['label', 'bar'],
  base: {
    label: { display: 'block', mt: '3', textStyle: 'ballot-progress', color: 'fg.muted' },
    bar: {
      position: 'absolute',
      insetX: '0',
      bottom: '[calc(({sizes.bar.thin} + {borderWidths.hairline}) / -2)]',
    },
  },
})
