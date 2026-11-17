import { defineSlotRecipe } from '@chakra-ui/react'

// Where the shell keeps clear of the phone's action bar (ui/ActionBar, recipe `questionDock` variant `ballot`) and
// hands it the credit.
const WITH_BAR = '&:has([data-scope="action-bar"][data-part="root"])'

// The voter page's frame (ui/VoterShell), boards V4Voter* and M4Voter*: the top bar, the vote's strip below `lg`, the
// body with the agenda rail from `lg`, and the "made with Vocdoni" credit at the foot. The column's width from `lg`
// is the `column` variant; below `lg` it is the whole width on a phone (20px sides) and 560px on a tablet.
export const VoterShell = defineSlotRecipe({
  slots: [
    'root',
    'topbar',
    'brand',
    'symbol',
    'name',
    'actions',
    'strip',
    'head',
    'title',
    'body',
    'rail',
    'railHead',
    'main',
    'foot',
    'credit',
    'links',
  ],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      minH: '[100dvh]',
      bg: 'bg.panel',
      color: 'fg',
      textStyle: 'ballot-body',
      fontVariantNumeric: 'tabular-nums',
      // With an action bar: below `md` the column keeps clear of the fixed bar and the credit moves into the bar.
      [`${WITH_BAR} [data-scope="voter-shell"][data-part="main"]`]: {
        pb: { base: '[calc({spacing.ballot.dock} + env(safe-area-inset-bottom))]', md: '10' },
      },
      [`${WITH_BAR} [data-scope="voter-shell"][data-part="foot"]`]: {
        display: { base: 'none', md: 'flex' },
      },
    },
    // 56px tall with 20px sides, 64px with 32px sides from `lg`, over the light rule.
    topbar: {
      display: 'flex',
      alignItems: 'center',
      gap: '3',
      flexShrink: 0,
      h: { base: '14', lg: '16' },
      px: { base: '5', lg: '8' },
      borderBottomWidth: 'hairline',
      borderColor: 'border.muted',
    },
    brand: { display: 'flex', alignItems: 'center', flexShrink: 0, h: 'ballot.logo', color: 'fg' },
    // The Vocdoni symbol when the vote shows no organisation logo: 22px tall, in ink.
    symbol: { h: 'ballot.symbol', w: 'auto' },
    name: { minW: '0', textStyle: 'topbar-name', truncate: true },
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '4',
      ms: 'auto',
      flexShrink: 0,
      textStyle: 'topbar-link',
      color: 'fg.muted',
    },
    // Below `lg`: the vote's title and status over the step progress, ruled off; 560px wide and centred on a tablet.
    // Positioned, so the progress line can sit on its bottom rule.
    strip: {
      display: { base: 'flex', lg: 'none' },
      flexDirection: 'column',
      position: 'relative',
      alignSelf: 'center',
      w: 'full',
      maxW: { base: 'full', md: 'lead' },
      px: { base: '5', md: '0' },
      pt: { base: '3', md: '4.5' },
      pb: { base: '2.5', md: '3.5' },
      borderBottomWidth: 'hairline',
      borderColor: 'border',
    },
    head: { display: 'flex', flexDirection: 'column', gap: '0.5' },
    title: { textStyle: 'ballot-rail-title' },
    body: {
      display: 'flex',
      flex: '1',
      flexDirection: { base: 'column', lg: 'row' },
      justifyContent: { base: 'flex-start', lg: 'center' },
      alignItems: { base: 'stretch', lg: 'flex-start' },
      gap: { base: '0', lg: 'ballot.gutter' },
      px: { base: '0', lg: '8' },
      pt: { base: '0', lg: '14' },
    },
    // From `lg`: 280px beside the column, the vote's head ruled off over the agenda.
    rail: {
      display: { base: 'none', lg: 'flex' },
      flexDirection: 'column',
      gap: '6',
      w: 'ballot.rail',
      flexShrink: 0,
    },
    railHead: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1',
      pb: '5',
      borderBottomWidth: 'hairline',
      borderColor: 'border',
    },
    main: {
      display: 'flex',
      flexDirection: 'column',
      w: 'full',
      minW: '0',
      alignSelf: { base: 'stretch', md: 'center', lg: 'flex-start' },
      px: { base: '5', md: '0' },
      pt: { base: '5', md: '9', lg: '0' },
      pb: { base: '5', md: '10' },
    },
    // The credit's row at the page's foot: 48px, centred.
    foot: { display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, h: '12' },
    // "Votació feta amb", the Vocdoni wordmark and the terms and privacy links, 6px apart: 12px in the quiet ink, the
    // wordmark 13px tall in ink. It never takes the vote's colour. On a narrow phone the links wrap onto a second line,
    // centred. The wordmark is sized here, so the svg carries no style of its own.
    credit: {
      display: 'inline-flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5',
      rowGap: '0',
      textStyle: 'caption',
      color: 'fg.subtle',
      '& > svg': { h: 'wordmark.credit', w: 'auto' },
    },
    // The links after the wordmark, behind a middle dot (owner ruling R18).
    links: { _before: { content: '"·"', me: '1.5' } },
  },
  variants: {
    // The column from `lg`: beside the rail (600px), or centred on its own: identification (440px), the one-time code
    // (480px), sending (520px), a status screen (560px) or the results (640px). 560px on a tablet whatever it is.
    column: {
      rail: { main: { maxW: { base: 'full', md: 'lead', lg: 'ballot.column' } } },
      narrow: { main: { maxW: { base: 'full', md: 'lead', lg: 'ballot.column.narrow' } } },
      code: { main: { maxW: { base: 'full', md: 'lead', lg: 'ballot.column.code' } } },
      sending: { main: { maxW: { base: 'full', md: 'lead', lg: 'ballot.column.sending' } } },
      status: { main: { maxW: { base: 'full', md: 'lead' } } },
      results: { main: { maxW: { base: 'full', md: 'lead', lg: 'ballot.column.results' } } },
    },
  },
  defaultVariants: { column: 'status' },
})
