import { Box, Flex, Text } from '@chakra-ui/react'
import { useContext, useEffect, useState } from 'react'
import { DashboardLayoutContext } from '~elements/DashboardLayoutContext'
import { DEFAULT_PALETTE, palettes } from '~theme/palettes'

const STORAGE_KEY = 'demo-palette'

const applyPalette = (id: string) => {
  if (id === DEFAULT_PALETTE.id) {
    delete document.documentElement.dataset.palette
  } else {
    document.documentElement.dataset.palette = id
  }
}

/**
 * Throwaway demo control: switches between the experiment palettes defined in
 * ~theme/palettes so the team can compare color directions live.
 */
const PaletteSwitcher = () => {
  const { reduced } = useContext(DashboardLayoutContext)
  const [active, setActive] = useState(DEFAULT_PALETTE.id)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && palettes.some((p) => p.id === stored)) {
      setActive(stored)
      applyPalette(stored)
    }
  }, [])

  const select = (id: string) => {
    setActive(id)
    localStorage.setItem(STORAGE_KEY, id)
    applyPalette(id)
  }

  if (reduced) return null

  return (
    <Box px={4} py={3} borderTop='1px solid' borderColor='table.border'>
      <Text fontSize='xs' fontWeight='bold' color='texts.subtle' mb={2}>
        Theme preview
      </Text>
      <Flex gap={2} flexWrap='wrap'>
        {palettes.map((palette) => (
          <Box
            key={palette.id}
            as='button'
            title={palette.label}
            aria-label={palette.label}
            aria-pressed={active === palette.id}
            onClick={() => select(palette.id)}
            w='22px'
            h='22px'
            borderRadius='full'
            cursor='pointer'
            border='1px solid'
            borderColor='table.border'
            outline={active === palette.id ? '2px solid' : 'none'}
            outlineColor='var(--pal-accent)'
            outlineOffset='1px'
            // Split circle: surface tint on top, accent on the bottom
            background={`linear-gradient(135deg, ${palette.swatch.bg} 50%, ${palette.swatch.accent} 50%)`}
            transition='transform 0.15s ease'
            _hover={{ transform: 'scale(1.15)' }}
          />
        ))}
      </Flex>
      <Text fontSize='xs' color='texts.subtle' mt={2}>
        {palettes.find((p) => p.id === active)?.label}
      </Text>
    </Box>
  )
}

export default PaletteSwitcher
