import { defineSlotRecipe } from '@chakra-ui/react'

// Text's `subheader` look.
const mutedDescription = { color: 'fg.muted', fontWeight: 'normal' }

// Styles of ui/ConfirmDialog. Each layout keeps the spacing and title of one of the confirm shells the app
// had before they were merged into it.
export const ConfirmModal = defineSlotRecipe({
  slots: ['header', 'title', 'body', 'description', 'footer', 'cancel', 'confirm'],
  variants: {
    layout: {
      panel: {
        header: { pb: 0 },
        description: mutedDescription,
        footer: { gap: 2 },
      },
      // The footer sits in the body's bottom padding instead of Chakra's footer spacing.
      inline: {
        header: { pb: 0 },
        body: { pb: 0 },
        description: mutedDescription,
        footer: { pt: 4, pb: 6, gap: 2 },
      },
      // Footer right under the description, as the account deletion notice has it.
      compact: {
        header: { pb: 0 },
        body: { pb: 0 },
        description: mutedDescription,
        footer: { pt: 0, pb: 6, gap: 3 },
      },
      // Rendered by useConfirm inside react-components' ConfirmShell. The title keeps the line height the
      // header inherits from the dialog content.
      shell: {
        title: { fontSize: 'lg', lineHeight: '1.25rem', fontWeight: 'extrabold' },
        cancel: { border: '1px solid', borderColor: 'border' },
      },
      // The vote confirmation: heading-sized title with the description under it, in the header.
      summary: {
        header: { flexDirection: 'column' },
        title: { fontFamily: 'heading', textStyle: 'xl', fontWeight: 'extrabold' },
        description: mutedDescription,
        cancel: { border: '1px solid', borderColor: 'border' },
      },
    },
    destructive: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      layout: 'shell',
      destructive: true,
      css: {
        confirm: {
          bg: 'destructive.solid',
          color: 'destructive.contrast',
          _hover: { bg: 'destructive.solid/90' },
        },
      },
    },
  ],
  defaultVariants: { layout: 'panel', destructive: true },
})
