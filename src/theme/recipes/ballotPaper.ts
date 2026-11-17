import { defineSlotRecipe } from '@chakra-ui/react'

// The empty mark a voter will fill: a 1.5px ring in the control outline, larger below `lg` (boards M4VotePaper).
const ring = '[inset 0 0 0 {borderWidths.mark} {colors.border.strong}]'
const dot = { boxSize: { base: '4.5', lg: '4' } }
// The quiet note of the boards: 14px up to `lg`, 13px from `lg`, on the running line (the `meta` style sets a fixed
// 20px line on touch screens, which drifts a third of a pixel per line from the boards).
const quiet = { fontSize: { base: 'md', lg: 'sm' }, lineHeight: 'moderate', color: 'fg.subtle' } as const

// The voters' running text (the intro, a question's description), as markdown paragraphs.
const running = {
  mt: '1',
  maxW: { lg: 'lead' },
  fontSize: { base: 'item', lg: 'md' },
  lineHeight: 'moderate',
  color: 'fg.muted',
  '& > * + *': { mt: '2' },
} as const

// The organiser's view of a ballot (Papereta, boards V4VotePaper and M4VotePaper): the title line, the intro card,
// each question's head (number, title, description, note, type tag) and its option rows with an empty mark, and the statement rows
// of the side cards. `kind` picks the mark: a radio, a checkbox, a rank box or a points box.
export const BallotPaper = defineSlotRecipe({
  slots: [
    'header',
    'heading',
    'count',
    'intro',
    'introLabel',
    'introText',
    'head',
    'number',
    'title',
    'description',
    'note',
    'tag',
    'option',
    'mark',
    'statement',
    'statementTitle',
    'statementNote',
    'statementText',
    'tile',
  ],
  base: {
    header: {
      display: 'flex',
      alignItems: { base: 'center', lg: 'baseline' },
      justifyContent: 'space-between',
      gap: { base: '3', lg: '4' },
    },
    heading: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '2.5',
      minW: '0',
      fontSize: { base: 'lg', lg: 'item' },
      lineHeight: 'moderate',
      fontWeight: 'semibold',
      letterSpacing: 'heading.row',
    },
    // The count after the title, desktop only.
    count: {
      ...quiet,
      display: { base: 'none', lg: 'block' },
      fontWeight: 'normal',
      letterSpacing: 'body',
      whiteSpace: 'nowrap',
    },
    // The touch boards keep the phone's 16px sides on a tablet too.
    intro: { pt: '3.5', pb: '4', px: { base: '4', lg: 'card' } },
    introLabel: {
      fontSize: { base: 'sm', lg: 'xs' },
      lineHeight: 'moderate',
      fontWeight: 'medium',
      color: 'fg.subtle',
    },
    introText: running,
    // Number, title and note; the tag goes under the note on a phone and at the end of the title's line from `md`.
    // The 1px short at the bottom is the first option's rule.
    head: {
      display: 'grid',
      gridTemplateColumns: { base: '[{sizes.6} minmax(0, 1fr)]', md: '[{sizes.6} minmax(0, 1fr) auto]' },
      columnGap: '2',
      rowGap: { base: '0.5', lg: '0' },
      alignItems: { base: 'stretch', lg: 'start' },
      pt: { base: '3.5', md: '4' },
      pb: { base: '3.5', md: '[calc({spacing.4} - {borderWidths.hairline})]' },
      px: { base: '4', md: 'card' },
    },
    number: {
      fontFamily: 'figure',
      fontSize: 'sm',
      lineHeight: 'row.touch',
      letterSpacing: 'none',
      color: 'fg.subtle',
    },
    title: {
      gridColumn: '2',
      fontSize: 'lg',
      lineHeight: 'row.touch',
      fontWeight: 'semibold',
      letterSpacing: 'heading.item',
    },
    // A question's own text under its title, as the intro's.
    description: { ...running, gridColumn: '2' },
    note: { ...quiet, gridColumn: '2', mt: { lg: 'note.paper' } },
    // Centred on the title's first line from `md`; on a tablet the board stretches it to the row (21px).
    tag: {
      gridColumn: { base: '2', md: '3' },
      gridRow: { md: '1' },
      justifySelf: 'start',
      alignSelf: { base: 'start', md: 'stretch', lg: 'start' },
      mt: { base: '1.5', md: '[calc(({lineHeights.row.touch} - {sizes.5}) / 2)]' },
    },
    // Options line up with the title: the card's edge, the number's column and the gap.
    option: {
      display: 'flex',
      alignItems: 'center',
      gap: '3',
      minH: { base: 'option.touch', md: 'option' },
      ps: {
        base: '[calc({spacing.4} + {sizes.6} + {spacing.2})]',
        md: '[calc({spacing.card} + {sizes.6} + {spacing.2})]',
      },
      pe: { base: '4', md: 'card' },
      borderTopWidth: 'hairline',
      borderColor: 'border.muted',
      fontSize: { base: 'item', md: 'md' },
      lineHeight: 'moderate',
    },
    mark: {
      flexShrink: '0',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: ring,
      textStyle: 'figure',
      color: 'fg.subtle',
    },
    // A side card's row: a title over a quiet note. Below `lg` the note runs inline, on the title's 15px line.
    statement: { flex: '1', minW: '0', fontSize: { base: 'item', lg: 'md' }, lineHeight: 'moderate' },
    statementTitle: { display: 'block', fontWeight: 'medium-plus' },
    statementNote: { ...quiet, display: { base: 'inline', lg: 'block' } },
    // The note under a statement's title, on its own line.
    statementText: { ...quiet, mt: '0.5' },
    // The icon before a statement, in a ringed square (the icon is 15px, `icon.chevron`).
    tile: {
      flexShrink: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSize: '7',
      borderRadius: 'sm',
      boxShadow: '[inset 0 0 0 {borderWidths.hairline} {colors.border.emphasized}]',
      color: 'fg.muted',
    },
  },
  variants: {
    kind: {
      one: { mark: { ...dot, borderRadius: 'full' } },
      many: { mark: { ...dot, borderRadius: 'sm' } },
      rank: { mark: { boxSize: { base: 'mark.box.touch', lg: 'mark.box' }, borderRadius: 'sm' } },
      points: {
        mark: {
          w: { base: 'mark.wide.touch', lg: 'mark.wide' },
          h: { base: 'mark.box.touch', lg: 'mark.box' },
          borderRadius: 'sm',
        },
      },
    },
  },
})
