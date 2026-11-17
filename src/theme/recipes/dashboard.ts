import { defineRecipe } from '@chakra-ui/react'

// Styles of Dashboard/Contents' DashboardContents, read by import: the column every dashboard page sits in. The side
// gutter is the guide's, 16px on a phone, 24px on a tablet and 28px from `lg`; it lives here and not in a token,
// because a token cannot change per breakpoint.
export const DashboardContents = defineRecipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    w: 'full',
    px: { base: '4', md: '6', lg: '7' },
    py: '6',
  },
  variants: {
    // The votes screens' page padding, as the Fil boards draw it: 20 40 on a phone, 28 48 on a tablet, 36 40 from `lg`.
    rhythm: {
      board: { pt: { base: '5', md: '7', lg: '9' }, pb: { base: '10', md: '12', lg: '10' } },
    },
  },
})
