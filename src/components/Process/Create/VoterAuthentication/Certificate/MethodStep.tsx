import {
  Box,
  chakra,
  Flex,
  Icon,
  Portal,
  RadioCard,
  SimpleGrid,
  Text,
  Tooltip,
  useBreakpointValue,
} from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuIdCard, LuInfo, LuKeyboard } from 'react-icons/lu'
import type { IconType } from 'react-icons'
import { optionCardStyles } from '../utils'

export type AuthMethodChoice = 'details' | 'certificate'

const ease = '200ms cubic-bezier(0.2, 0, 0, 1)'

// Hover and keyboard focus open it; a tap toggles it, since Zag ignores touch pointers.
// It lives inside the card's label so click is cancelled: reading must not select the method.
const CertificateInfo = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const pointer = useRef<string>('')
  const trigger = useRef<HTMLButtonElement>(null)
  // Phones: below the button, so it doesn't cover the card title or the other card.
  const placement = useBreakpointValue({ base: 'bottom-end', md: 'top' } as const) ?? 'top'

  // A tap elsewhere closes it on touch screens, where there is no pointer leave.
  useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent) => {
      if (!trigger.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  return (
    <Tooltip.Root
      open={open}
      onOpenChange={(details) => setOpen(details.open)}
      openDelay={150}
      closeDelay={100}
      closeOnClick={false}
      closeOnPointerDown={false}
      positioning={{ placement }}
    >
      <Tooltip.Trigger asChild>
        <chakra.button
          ref={trigger}
          type='button'
          aria-label={t('voter_auth.method.certificate_info_label', {
            defaultValue: 'Which digital certificates work?',
          })}
          display='inline-flex'
          verticalAlign='middle'
          alignItems='center'
          justifyContent='center'
          boxSize={6}
          ms={0.5}
          mt='-2px'
          borderRadius='full'
          color='fg.muted'
          cursor='help'
          _hover={{ color: 'fg', bg: 'bg.muted' }}
          _focusVisible={{ outline: '2px solid', outlineColor: 'fg', outlineOffset: '1px' }}
          onPointerDown={(event) => {
            pointer.current = event.pointerType
          }}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            if (pointer.current === 'touch') setOpen((v) => !v)
            else setOpen(true)
            pointer.current = ''
          }}
        >
          <Icon as={LuInfo} boxSize={4} />
        </chakra.button>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content maxW='17rem' px={3} py={2}>
            <Text fontSize='sm' lineHeight='1.5'>
              {t('voter_auth.method.certificate_info_accepted', {
                defaultValue: 'We accept idCAT Certificat and FNMT, the Spanish digital certificates.',
              })}
            </Text>
            <Text fontSize='sm' lineHeight='1.5' mt={1.5}>
              {t('voter_auth.method.certificate_info_other', {
                defaultValue: 'Need another type of digital certificate? Ask the Vocdoni team.',
              })}
            </Text>
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  )
}

type MethodDef = {
  value: AuthMethodChoice
  titleKey: string
  titleDefault: string
  descriptionKey: string
  descriptionDefault: string
  icon: IconType
  info?: boolean
}

const METHOD_DEFS: MethodDef[] = [
  {
    value: 'details',
    titleKey: 'voter_auth.method.details_title',
    titleDefault: 'Member details',
    descriptionKey: 'voter_auth.method.details_description',
    descriptionDefault: 'Voters type in details from your member list, like their member number.',
    icon: LuKeyboard,
  },
  {
    value: 'certificate',
    titleKey: 'voter_auth.method.certificate_title',
    titleDefault: 'Digital certificate (DNI/NIE)',
    descriptionKey: 'voter_auth.method.certificate_description',
    descriptionDefault: 'Voters sign in with their own digital certificate.',
    icon: LuIdCard,
    info: true,
  },
]

const MethodCard = ({ def, selected, compact }: { def: MethodDef; selected: boolean; compact: boolean }) => {
  const { t } = useTranslation()
  const title = t(def.titleKey, { defaultValue: def.titleDefault })
  const description = t(def.descriptionKey, { defaultValue: def.descriptionDefault })

  return (
    <RadioCard.Item
      value={def.value}
      {...optionCardStyles}
      bg='bg'
      cursor='pointer'
      transition={`border-color ${ease}, background-color ${ease}`}
      _hover={{ borderColor: selected ? 'colorPalette.solid' : 'border.emphasized', bg: selected ? 'bg' : 'bg.subtle' }}
      // fg (near-black) clears 3:1 against white; colorPalette.focusRing resolves to low contrast here.
      _focusVisible={{ outline: '2px solid', outlineColor: 'fg', outlineOffset: '2px' }}
      _motionReduce={{ transition: 'none' }}
    >
      <RadioCard.ItemHiddenInput />
      <RadioCard.ItemControl
        px={compact ? 3 : 4}
        py={compact ? 2.5 : 4}
        gap={3}
        alignItems={compact ? 'center' : 'start'}
        transition={`padding ${ease}`}
        _motionReduce={{ transition: 'none' }}
      >
        <Flex
          aria-hidden
          flexShrink={0}
          align='center'
          justify='center'
          boxSize={compact ? 8 : 10}
          borderRadius='l2'
          bg={selected ? 'colorPalette.solid' : 'bg.muted'}
          color={selected ? 'colorPalette.contrast' : 'fg'}
          transition={`width ${ease}, height ${ease}, background-color ${ease}, color ${ease}`}
          _motionReduce={{ transition: 'none' }}
        >
          <Icon as={def.icon} boxSize={compact ? 4 : 5} strokeWidth={1.75} />
        </Flex>
        <RadioCard.ItemContent gap={0} minW={0}>
          <RadioCard.ItemText fontSize={compact ? 'sm' : 'md'} fontWeight='semibold' lineHeight='1.4'>
            {def.info ? (
              // The last word and the info button wrap together, so the button never sits alone on a line.
              <>
                {title.split(' ').slice(0, -1).join(' ')}{' '}
                <Box as='span' whiteSpace='nowrap'>
                  {title.split(' ').at(-1)}
                  <CertificateInfo />
                </Box>
              </>
            ) : (
              title
            )}
          </RadioCard.ItemText>
          {/* Collapses once a method is chosen; inert keeps descriptions out of reach while hidden. */}
          <Box
            display='grid'
            gridTemplateRows={compact ? '0fr' : '1fr'}
            opacity={compact ? 0 : 1}
            transition={`grid-template-rows ${ease}, opacity ${ease}`}
            _motionReduce={{ transition: 'none' }}
            inert={compact}
          >
            <Box overflow='hidden' minH={0}>
              <RadioCard.ItemDescription
                fontSize='sm'
                lineHeight='1.45'
                color='fg.muted'
                opacity={1}
                mt={1}
                css={{ textWrap: 'pretty' }}
              >
                {description}
              </RadioCard.ItemDescription>
            </Box>
          </Box>
        </RadioCard.ItemContent>
        <RadioCard.ItemIndicator mt={compact ? 0 : 0.5} />
      </RadioCard.ItemControl>
    </RadioCard.Item>
  )
}

type MethodStepProps = {
  method: AuthMethodChoice | null
  onChange: (m: AuthMethodChoice) => void
  disabled?: boolean
}

export const MethodStep = ({ method, onChange, disabled }: MethodStepProps) => {
  const { t } = useTranslation()
  return (
    <RadioCard.Root
      name='method'
      size='sm'
      value={method}
      onValueChange={({ value }) => value && onChange(value as AuthMethodChoice)}
      disabled={disabled}
    >
      <RadioCard.Label fontSize='sm' fontWeight='semibold'>
        {t('voter_auth.method.heading', { defaultValue: '1. How will voters prove who they are?' })}
      </RadioCard.Label>
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3} mt={3}>
        {METHOD_DEFS.map((def) => (
          <MethodCard key={def.value} def={def} selected={method === def.value} compact={method !== null} />
        ))}
      </SimpleGrid>
    </RadioCard.Root>
  )
}
