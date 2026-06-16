import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuCheck } from 'react-icons/lu'
import { EASE } from './motion'

type StepDef = { label: string }

export type WizardProgressProps = {
  currentStep: number
}

const Node = ({ state }: { state: 'done' | 'current' | 'todo' }) => {
  const isDone = state === 'done'
  const isCurrent = state === 'current'
  return (
    <Box
      flexShrink={0}
      boxSize={6}
      borderRadius='full'
      display='flex'
      alignItems='center'
      justifyContent='center'
      border='2px solid'
      borderColor={isDone || isCurrent ? 'brand.500' : 'table.border'}
      bg={isDone ? 'brand.500' : 'transparent'}
      color={isDone ? 'white' : isCurrent ? 'brand.500' : 'texts.subtle'}
      css={{ transition: `all 0.3s ${EASE}` }}
    >
      {isDone ? (
        <Icon as={LuCheck} boxSize={3.5} />
      ) : (
        <Box boxSize={2} borderRadius='full' bg={isCurrent ? 'brand.500' : 'transparent'} />
      )}
    </Box>
  )
}

const Connector = ({ filled }: { filled: boolean }) => (
  <Box flex={1} h='2px' bg='table.border' mx={2} borderRadius='full' overflow='hidden'>
    <Box h='full' bg='brand.500' css={{ width: filled ? '100%' : '0%', transition: `width 0.35s ${EASE}` }} />
  </Box>
)

/**
 * Connected-node step indicator for the auth wizard. The connector between
 * nodes fills as the admin advances, giving a clear sense of progress.
 */
export const WizardProgress = ({ currentStep }: WizardProgressProps) => {
  const { t } = useTranslation()
  const steps: StepDef[] = [
    { label: t('voter_auth.progress.identity', { defaultValue: 'Identity' }) },
    { label: t('voter_auth.progress.verification', { defaultValue: 'Verification' }) },
    { label: t('voter_auth.progress.launch', { defaultValue: 'Launch' }) },
  ]

  return (
    <VStack gap={2} w='full'>
      <HStack w='full' align='center' gap={0}>
        {steps.map((step, index) => {
          const state = index < currentStep ? 'done' : index === currentStep ? 'current' : 'todo'
          return (
            <HStack key={step.label} flex={index < steps.length - 1 ? 1 : '0 0 auto'} gap={0} align='center'>
              <Node state={state} />
              {index < steps.length - 1 && <Connector filled={index < currentStep} />}
            </HStack>
          )
        })}
      </HStack>
      <HStack w='full' justify='space-between'>
        {steps.map((step, index) => (
          <Text
            key={step.label}
            fontSize='xs'
            fontWeight={index === currentStep ? 'semibold' : 'normal'}
            color={index <= currentStep ? 'texts.primary' : 'texts.subtle'}
            css={{ transition: `color 0.3s ${EASE}` }}
            flex={index === 0 ? '0 0 auto' : index === steps.length - 1 ? '0 0 auto' : 1}
            textAlign={index === 0 ? 'start' : index === steps.length - 1 ? 'end' : 'center'}
          >
            {step.label}
          </Text>
        ))}
      </HStack>
    </VStack>
  )
}
