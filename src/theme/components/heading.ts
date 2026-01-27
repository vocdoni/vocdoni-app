import { defineRecipe } from '@chakra-ui/react'

const sidebarTitle = {
  pt: 4,
}

const sidebarSubtitle = {
  py: 4,
  textTransform: 'capitalize',
}

export const Heading = defineRecipe({
  base: {
    fontWeight: 'bold',
  },
  variants: {
    variant: {
      header: {
        fontWeight: 'extrabold',
      },
      ['sidebar-title']: sidebarTitle,
      ['sidebar-subtitle']: sidebarSubtitle,
    },
  },
})

export const ElectionTitle = defineRecipe({
  base: {
    fontWeight: 'bold',
    fontSize: 'xl',
    textAlign: 'center',
    lineHeight: 1.1,
    mb: 3,
  },
})

export const ElectionSchedule = defineRecipe({
  base: {
    fontWeight: 'bold',
    fontSize: 'sm',
    textAlign: 'center',
    fontStyle: 'italic',
    color: 'gray.400',
  },
})
