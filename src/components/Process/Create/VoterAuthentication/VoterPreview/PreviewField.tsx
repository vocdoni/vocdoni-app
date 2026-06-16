import { Box, chakra, Text } from '@chakra-ui/react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'
import { fadeUp } from '../motion'

gsap.registerPlugin(useGSAP)

export type PreviewFieldProps = {
  label: string
  value: string
}

/**
 * A read-only mock input on the voter preview screen. When it mounts (because
 * the admin selected a credential) its example value types itself in, so the
 * admin instantly recognises what the voter will be asked for.
 */
export const PreviewField = ({ label, value }: PreviewFieldProps) => {
  const valueRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const el = valueRef.current
      if (!el) return

      const prefersReduced =
        typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

      if (prefersReduced) {
        el.textContent = value
        return
      }

      const state = { chars: 0 }
      gsap.to(state, {
        chars: value.length,
        duration: Math.min(0.9, Math.max(0.25, value.length * 0.04)),
        ease: 'none',
        onUpdate: () => {
          el.textContent = value.slice(0, Math.round(state.chars))
        },
      })
    },
    { dependencies: [value] }
  )

  return (
    <Box css={{ animation: `${fadeUp} 0.28s ease both` }}>
      <Text fontSize='10px' fontWeight='medium' color='texts.subtle' mb={1} lineHeight={1}>
        {label}
      </Text>
      <Box
        borderRadius='md'
        border='1px solid'
        borderColor='auth.card.border'
        bg='auth.card.bg'
        px={2.5}
        py={1.5}
        minH='26px'
        display='flex'
        alignItems='center'
      >
        <chakra.span ref={valueRef} fontSize='xs' color='texts.primary' />
      </Box>
    </Box>
  )
}
