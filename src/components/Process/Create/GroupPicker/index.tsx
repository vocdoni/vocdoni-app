import {
  Box,
  Button,
  chakra,
  FieldErrorText,
  FieldRoot,
  HStack,
  Icon,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuUsers } from 'react-icons/lu'
import { CensusTypes } from '~components/Process/Census/CensusType'
import { Group, useGroups } from '~src/queries/groups'
import { breathe, EASE } from '../VoterAuthentication/motion'
import { GroupDrawer } from './GroupDrawer'

gsap.registerPlugin(useGSAP)

type GroupsQuery = ReturnType<typeof useGroups>

export type GroupPickerCardProps = {
  groups: Group[]
} & Pick<GroupsQuery, 'fetchNextPage' | 'hasNextPage' | 'isFetching'>

/** Smoothly counts up to the member total for a touch of life. */
const CountUp = ({ value }: { value: number }) => {
  const ref = useRef<HTMLSpanElement>(null)
  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const prefersReduced =
        typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      if (prefersReduced) {
        el.textContent = String(value)
        return
      }
      const state = { n: 0 }
      gsap.to(state, {
        n: value,
        duration: 0.5,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = String(Math.round(state.n))
        },
      })
    },
    { dependencies: [value] }
  )
  return <chakra.span ref={ref}>{value}</chakra.span>
}

/**
 * Visual replacement for the group dropdown. Shows an inviting empty state or a
 * confident selected state, and opens a rich chooser drawer on click.
 */
export const GroupPickerCard = ({ groups, fetchNextPage, hasNextPage, isFetching }: GroupPickerCardProps) => {
  const { t } = useTranslation()
  const { open: isDrawerOpen, onOpen, onClose } = useDisclosure()
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext()
  const censusType = watch('censusType')

  return (
    <FieldRoot invalid={!!errors.groupId}>
      <Controller
        control={control}
        name='groupId'
        rules={{
          required: {
            value: censusType === CensusTypes.CSP,
            message: t('form.error.required', 'This field is required'),
          },
        }}
        render={({ field }) => {
          const selected = groups?.find((g) => g.id === field.value) ?? null
          const title = selected?.isAutoGroup
            ? t('groups_board.auto_group.title', { defaultValue: 'All Members' })
            : selected?.title

          return (
            <>
              {selected ? (
                <HStack
                  w='full'
                  gap={3}
                  p={4}
                  borderWidth='1px'
                  borderColor='table.border'
                  borderRadius='xl'
                  bg='auth.card.bg'
                >
                  <Box bg='auth.bg' p={2.5} borderRadius='lg' color='texts.primary' lineHeight={0} flexShrink={0}>
                    <Icon as={LuUsers} boxSize={5} />
                  </Box>
                  <VStack align='start' gap={0} flex={1} minW={0}>
                    <Text fontWeight='semibold' lineClamp={1}>
                      {title}
                    </Text>
                    <Text fontSize='sm' color='texts.subtle'>
                      <CountUp value={selected.membersCount ?? 0} />{' '}
                      {t('voter_auth.group.voters', { defaultValue: 'voters' })}
                    </Text>
                  </VStack>
                  <Button variant='ghost' size='sm' onClick={onOpen} flexShrink={0}>
                    {t('voter_auth.group.change', { defaultValue: 'Change' })}
                  </Button>
                </HStack>
              ) : (
                <VStack
                  w='full'
                  gap={3}
                  p={6}
                  borderWidth='2px'
                  borderStyle='dashed'
                  borderColor='table.border'
                  borderRadius='xl'
                  css={{ transition: `border-color 0.2s ${EASE}` }}
                  _hover={{ borderColor: 'gray.400' }}
                >
                  <Box color='texts.subtle' css={{ animation: `${breathe} 3s ease-in-out infinite` }}>
                    <Icon as={LuUsers} boxSize={7} />
                  </Box>
                  <Text fontSize='sm' color='texts.subtle' textAlign='center'>
                    {t('voter_auth.group.no_group_selected', { defaultValue: 'No group of voters selected yet' })}
                  </Text>
                  <Button size='sm' onClick={onOpen}>
                    {t('voter_auth.group.choose', { defaultValue: 'Choose a group' })}
                  </Button>
                </VStack>
              )}

              <GroupDrawer
                isOpen={isDrawerOpen}
                onClose={onClose}
                groups={groups ?? []}
                selectedId={field.value}
                onSelect={(id) => field.onChange(id)}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetching={isFetching}
              />
            </>
          )
        }}
      />
      <FieldErrorText>{errors.groupId?.message?.toString()}</FieldErrorText>
    </FieldRoot>
  )
}
