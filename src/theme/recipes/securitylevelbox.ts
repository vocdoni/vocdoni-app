import { defineRecipe } from '@chakra-ui/react'

const baseStyle = {
  border: '2px solid',
  borderColor: 'table.border',
  borderRadius: 'md',
  py: 2,
  px: 4,
  fontWeight: 'bold',
  textAlign: 'center',
  w: 'full',
  color: 'white',
  textTransform: 'uppercase',
}

const weak = { bg: 'red.800', borderColor: 'red.600' }
const mid = { bg: 'orange.800', borderColor: 'orange.600' }
const strong = { bg: 'green.800', borderColor: 'green.600' }
const inactive = { bg: 'gray.900' }

export const SecurityLevelBox = defineRecipe({
  base: baseStyle,
  variants: {
    variant: {
      weak,
      mid,
      strong,
      inactive,
    },
  },
})
