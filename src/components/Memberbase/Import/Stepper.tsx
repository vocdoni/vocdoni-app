import { chakra, Flex, Icon, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuCheck } from 'react-icons/lu'

export const IMPORT_STEPS = ['upload', 'match', 'review', 'done'] as const
export type ImportStep = (typeof IMPORT_STEPS)[number]

type StepperProps = {
  current: ImportStep
  /** Going back to an earlier step; omitted once there's no going back (the import was sent) */
  onBack?: (step: ImportStep) => void
}

/**
 * The wizard's four steps, small: 24px circles and 12px labels. Only earlier steps are buttons. The
 * theme's `steps` recipe isn't used: it's sized for page-wide progress and renders huge from lg.
 */
export const Stepper = ({ current, onBack }: StepperProps) => {
  const { t } = useTranslation()
  const labels: Record<ImportStep, string> = {
    upload: t('members.import.steps.upload', { defaultValue: 'Upload' }),
    match: t('members.import.steps.match', { defaultValue: 'Match' }),
    review: t('members.import.steps.review', { defaultValue: 'Review' }),
    done: t('members.import.steps.done', { defaultValue: 'Done' }),
  }
  const currentIndex = IMPORT_STEPS.indexOf(current)

  return (
    <chakra.ol
      display='flex'
      alignItems='center'
      gap={{ base: 3, md: 3 }}
      flexWrap='wrap'
      listStyleType='none'
      aria-label={t('members.import.steps.label', { defaultValue: 'Import steps' })}
    >
      {IMPORT_STEPS.map((step, index) => {
        const done = index < currentIndex
        const active = index === currentIndex
        const clickable = done && Boolean(onBack)
        const content = (
          <>
            <Flex
              as='span'
              align='center'
              justify='center'
              boxSize='24px'
              flexShrink={0}
              borderRadius='full'
              fontSize='xs'
              fontWeight='bolder'
              fontVariantNumeric='tabular-nums'
              borderWidth='1px'
              borderColor={active || done ? 'colorPalette.solid' : 'border.emphasized'}
              bg={active ? 'colorPalette.solid' : 'transparent'}
              color={active ? 'colorPalette.contrast' : done ? 'colorPalette.fg' : 'fg.muted'}
              aria-hidden
            >
              {done ? <Icon as={LuCheck} boxSize={3.5} /> : index + 1}
            </Flex>
            <Text as='span' fontSize='xs' fontWeight={active ? 'bolder' : 'normal'} color={active ? 'fg' : 'fg.muted'}>
              {labels[step]}
            </Text>
          </>
        )

        return (
          <Flex as='li' key={step} align='center' gap={{ base: 2, md: 3 }} aria-current={active ? 'step' : undefined}>
            {/* Phones drop the connectors so the four steps fit one row */}
            {index > 0 && (
              <chakra.span
                display={{ base: 'none', sm: 'block' }}
                w={{ sm: 3, md: 6 }}
                h='1px'
                bg='border.emphasized'
                aria-hidden
              />
            )}
            {clickable ? (
              <chakra.button
                type='button'
                display='flex'
                alignItems='center'
                gap={1.5}
                borderRadius='md'
                _hover={{ '& > span:last-of-type': { color: 'fg', textDecoration: 'underline' } }}
                _focusVisible={{ outline: '2px solid', outlineColor: 'colorPalette.focusRing', outlineOffset: '2px' }}
                onClick={() => onBack?.(step)}
              >
                {content}
              </chakra.button>
            ) : (
              <Flex align='center' gap={1.5}>
                {content}
              </Flex>
            )}
          </Flex>
        )
      })}
    </chakra.ol>
  )
}
