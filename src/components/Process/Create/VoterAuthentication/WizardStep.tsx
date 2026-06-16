import { Box } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { EASE } from './motion'

export type WizardStepProps = {
  isActive: boolean
  direction: 'forward' | 'backward'
  children: ReactNode
}

/**
 * Slide-with-depth transition wrapper. Inactive steps fade out, shrink slightly
 * and shift in the travel direction, then are taken out of the layout flow so
 * the active step owns the space. Honours prefers-reduced-motion via CSS.
 */
export const WizardStep = ({ isActive, direction, children }: WizardStepProps) => {
  const offset = direction === 'forward' ? '24px' : '-24px'
  return (
    <Box
      aria-hidden={!isActive}
      css={{
        opacity: isActive ? 1 : 0,
        transform: isActive ? 'translateX(0) scale(1)' : `translateX(${offset}) scale(0.98)`,
        transition: `opacity 0.2s ${EASE}, transform 0.26s ${EASE}`,
        position: isActive ? 'relative' : 'absolute',
        inset: 0,
        width: '100%',
        pointerEvents: isActive ? 'auto' : 'none',
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          transform: 'none',
        },
      }}
    >
      {children}
    </Box>
  )
}
