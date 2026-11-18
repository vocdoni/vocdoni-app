import { defineSlotRecipe } from '@chakra-ui/react'
import { touchTarget } from './touchTarget'

// The phases while a vote is sent (ui/PhaseList, board V4VoterWide 9): a 22px disc and a 17px line per phase, 10px
// above and below, 12px apart. `data-state` on the row and its disc is `done` (an ink disc, a muted line), `now` (the
// track's ring with a 2px arc in the vote's line colour turning, still when the reader asks for less motion; the line
// semibold in ink) or `next` (the track's ring, a quiet line).
export const PhaseList = defineSlotRecipe({
  slots: ['root', 'item', 'disc', 'label'],
  base: {
    root: { display: 'flex', flexDirection: 'column', listStyleType: 'none', m: '0', p: '0' },
    item: {
      display: 'flex',
      alignItems: 'center',
      gap: '3',
      py: '2.5',
      textStyle: 'ballot-phase',
      color: 'fg.subtle',
      '&[data-state=done]': { color: 'fg.muted' },
      '&[data-state=now]': { color: 'fg', fontWeight: 'semibold' },
    },
    disc: {
      flexShrink: 0,
      boxSize: 'mark.ballot',
      borderRadius: 'full',
      boxShadow: 'shadow.mark',
      '&[data-state=done]': { bg: 'bg.inverted', boxShadow: '[none]' },
      '&[data-state=now]': {
        boxShadow: '[inset 0 0 0 {borderWidths.thick} {colors.border.pending}]',
        borderTopWidth: 'thick',
        borderTopStyle: '[solid]',
        borderTopColor: 'colorPalette.border',
        animation: 'spin',
        _motionReduce: { animation: '[none]' },
      },
    },
    label: { minW: '0' },
  },
})

// A receipt's codes on the voter page (ui/ReceiptCodes, board V4VoterWide 10): one row per question under the light
// rule, 10px and 18px in, its title at 15px and its shortened vote id in mono. A code the voter can copy is a button
// with a 44px hit area.
export const ReceiptCodes = defineSlotRecipe({
  slots: ['root', 'row', 'title', 'code'],
  base: {
    root: { display: 'flex', flexDirection: 'column', listStyleType: 'none', m: '0', p: '0' },
    row: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: '4',
      px: '4.5',
      py: '2.5',
      borderTopWidth: 'hairline',
      borderColor: 'border.muted',
      textStyle: 'ballot-hint',
    },
    title: { minW: '0' },
    code: {
      flexShrink: 0,
      textStyle: 'ballot-receipt',
      color: 'fg.muted',
      '&:is(button)': {
        ...touchTarget,
        cursor: 'button',
        borderRadius: 'xs',
        focusVisibleRing: 'outside',
        focusRingColor: 'colorPalette.focusRing',
        _hover: { color: 'fg' },
      },
    },
  },
})

// The ruled list of questions on the welcome screen ("Ordre del dia") and of the next one when none is open ("La
// següent"): a 12px label, then rows under a rule, 11px above and below, each a 14px mono number 14px before the
// title, with an optional quiet note under it; a rule closes the list.
export const AgendaList = defineSlotRecipe({
  slots: ['root', 'label', 'list', 'item', 'number', 'body', 'note'],
  base: {
    root: { display: 'flex', flexDirection: 'column', gap: '2' },
    label: { textStyle: 'caption', color: 'fg.subtle' },
    list: { listStyleType: 'none', m: '0', p: '0', borderBottomWidth: 'hairline', borderColor: 'border' },
    item: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '3.5',
      py: 'row',
      borderTopWidth: 'hairline',
      borderColor: 'border',
      textStyle: 'ballot-body',
    },
    number: { flexShrink: 0, w: '3.5', textStyle: 'ballot-code', color: 'fg.subtle' },
    body: { display: 'flex', flexDirection: 'column', minW: '0' },
    note: { textStyle: 'body', color: 'fg.subtle' },
  },
})
