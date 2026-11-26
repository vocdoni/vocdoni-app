import { defineRecipe } from '@chakra-ui/react'

// A row set apart from the one above by a dashed rule, the edge of an explanation rather than data.
export const DashedRule = defineRecipe({
  base: {
    borderTopWidth: 'hairline',
    borderTopStyle: '[dashed]',
    borderColor: 'border.emphasized',
  },
})
