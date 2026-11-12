import { defineSlotRecipe, defineStyle } from '@chakra-ui/react'

// Text's `muted` variant.
const mutedDescription = defineStyle({ color: 'fg.muted', fontWeight: 'normal' })

// Styles of ui/ConfirmDialog. Layouts differ only in spacing and title; the buttons are the same everywhere.
export const ConfirmModal = defineSlotRecipe({
  slots: ['header', 'title', 'body', 'description', 'footer'],
  variants: {
    layout: {
      panel: {
        header: { pb: '[0]' },
        description: mutedDescription,
        footer: { gap: '2' },
      },
      // The footer sits in the body's bottom padding instead of Chakra's footer spacing.
      inline: {
        header: { pb: '[0]' },
        body: { pb: '[0]' },
        description: mutedDescription,
        footer: { pt: '4', pb: '6', gap: '2' },
      },
      // Footer right under the description, as the account deletion notice has it.
      compact: {
        header: { pb: '[0]' },
        body: { pb: '[0]' },
        description: mutedDescription,
        footer: { pt: '[0]', pb: '6', gap: '3' },
      },
      // Rendered by useConfirm inside react-components' ConfirmShell. The title keeps the line height the
      // header inherits from the dialog content.
      shell: {
        title: { fontSize: 'lg', lineHeight: '[1.25rem]', fontWeight: 'extrabold' },
      },
      // The vote confirmation: heading-sized title with the description under it, in the header.
      summary: {
        header: { flexDirection: 'column' },
        title: { fontFamily: 'heading', textStyle: 'xl', fontWeight: 'extrabold' },
        description: mutedDescription,
      },
    },
  },
  defaultVariants: { layout: 'panel' },
})
