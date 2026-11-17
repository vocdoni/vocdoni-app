import { defineSlotRecipe, defineStyle, type SystemStyleObject } from '@chakra-ui/react'

// Text's `muted` variant.
const mutedDescription = defineStyle({ color: 'fg.muted', fontWeight: 'normal' })

// The guide's confirm dialog (Components4 "Diàleg", the votes boards): a question, what will happen and an optional
// warning, then the safe action and the action. From `lg` a 460px dialog 168px from the top, its actions under a
// rule; on a tablet a 440px dialog with 12px corners and its actions in the same block; below `md` a bottom sheet
// with a grab handle and the action first, full width.
const decision = {
  backdrop: { bg: { base: 'scrim.sheet', lg: 'scrim.strong' } },
  positioner: {
    alignItems: { base: 'flex-end', md: 'flex-start' },
    pt: { base: '0', md: 'dialog.top.tablet', lg: 'dialog.top' },
  },
  content: {
    my: '0',
    mx: '0',
    w: 'full',
    maxW: { base: 'full', md: 'dialog.tablet', lg: 'dialog.desktop' },
    borderTopRadius: { base: 'xl', lg: 'md' },
    borderBottomRadius: { base: 'none', md: 'xl', lg: 'md' },
    px: { base: '4', md: 'card', lg: '0' },
    pt: { base: '2', md: 'card', lg: '0' },
    pb: { md: 'card', lg: '0' },
    // Under `mdDown`, like the dialog recipe's own bottom-sheet padding, so this one wins.
    mdDown: { pb: '[calc({spacing.6} + env(safe-area-inset-bottom))]' },
  },
  header: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '0',
    pt: { base: '0', lg: '6' },
    px: { base: '0', lg: '7' },
    pb: '0',
    // The sheet's grab handle, on a phone only.
    _before: {
      content: '""',
      display: { base: 'block', md: 'none' },
      alignSelf: 'center',
      w: '9',
      h: '1',
      mb: '3',
      borderRadius: 'bar',
      bg: 'bg.track',
    },
  },
  title: { textStyle: 'dialog-title', color: 'fg', textWrap: 'balance' },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '2', lg: '2.5' },
    pt: { base: '2', lg: '2.5' },
    px: { base: '0', lg: '7' },
    pb: { base: '0', lg: 'card' },
  },
  description: { textStyle: 'dialog-body', color: 'fg.muted', textWrap: 'pretty' },
  // DOM order is safe action, then action: a column-reverse puts the action on top on a phone.
  footer: {
    flexDirection: { base: 'column-reverse', md: 'row' },
    alignItems: { base: 'stretch', md: 'center' },
    justifyContent: 'flex-end',
    gap: '2',
    mt: { base: '5', lg: '0' },
    pt: { base: '0', lg: '4' },
    px: { base: '0', lg: '7' },
    pb: { base: '0', lg: '4.5' },
    borderTopWidth: { base: '[0]', lg: 'hairline' },
    borderTopColor: 'border',
  },
} satisfies Partial<Record<string, SystemStyleObject>>

// Styles of ui/ConfirmDialog. `decision` is the guide's confirm and the default; the other layouts are the older
// dialogs that differ only in spacing and title. The buttons are the same everywhere.
export const ConfirmModal = defineSlotRecipe({
  slots: [
    'backdrop',
    'positioner',
    'content',
    'header',
    'title',
    'body',
    'description',
    'warning',
    'warningIcon',
    'footer',
  ],
  // The warning line (an amber consequence the reader must not miss), in every layout.
  base: {
    warning: {
      display: 'flex',
      gap: '1.5',
      fontSize: { base: 'md', lg: 'control' },
      lineHeight: '[1.45]',
      color: 'fg.warning',
    },
    warningIcon: { flexShrink: '0', boxSize: '3.5', mt: '0.5', strokeWidth: '[1.8]' },
  },
  variants: {
    layout: {
      decision,
      panel: {
        header: { pb: '0' },
        description: mutedDescription,
        footer: { gap: '2' },
      },
      // The footer sits in the body's bottom padding instead of Chakra's footer spacing.
      inline: {
        header: { pb: '0' },
        body: { pb: '0' },
        description: mutedDescription,
        footer: { pt: '4', pb: '6', gap: '2' },
      },
      // Footer right under the description, as the account deletion notice has it.
      compact: {
        header: { pb: '0' },
        body: { pb: '0' },
        description: mutedDescription,
        footer: { pt: '0', pb: '6', gap: '3' },
      },
      // The vote confirmation: heading-sized title with the description under it, in the header.
      summary: {
        header: { flexDirection: 'column' },
        title: { fontFamily: 'heading', textStyle: 'xl', fontWeight: 'semibold', letterSpacing: 'tight' },
        description: mutedDescription,
      },
    },
  },
  defaultVariants: { layout: 'decision' },
})
