import { Alert, Button, CloseButton, Dialog, Flex, Portal, Text } from '@chakra-ui/react'
import { RefCallback, useCallback, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuKeyRound } from 'react-icons/lu'
import { useToast } from '~components/Toast'
import type { Group } from '~src/queries/groups'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { buildCensusSpec } from '../census-spec'
import { Census, Process } from '../common'
import { CENSUS_SETUP_TOAST_ID } from '../useCensusSetupToast'
import { useCensusSteps } from '../useCensusSteps'
import { AuthSummary } from './AuthSummary'
import { useCensusCheck } from './useCensusCheck'
import { censusConfigSignature, countedCredentials, PASSWORD_CREDENTIAL } from './utils'
import { useVoterAuthDialog } from './VoterAuthDialogContext'
import { VoterAuthForm } from './VoterAuthForm'

type VoterAuthenticationProps = {
  group?: Group | null
  // The census field's ref. The census is only ever set through this dialog, so
  // its trigger is the field's focus target: a blocked publish lands on the
  // button that fixes it.
  triggerRef?: RefCallback<HTMLButtonElement>
}

export const VoterAuthentication = ({ group, triggerRef }: VoterAuthenticationProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const { watch, setValue } = useFormContext<Process>()
  const { open: isOpen, onOpen, onClose } = useVoterAuthDialog()
  const { isAuthPending: isPending, hasAuthError: censusError } = useCensusSteps()

  const [groupId, census, anonymousVoting, weightedVote] = watch([
    'groupId',
    'census',
    'anonymousVoting',
    'weightedVote',
  ])

  // A group change resets the census, but the dialog keeps the previous
  // choices ticked so confirming them for the new group is quick.
  const lastCensus = useRef(census)
  if (census) lastCensus.current = census

  // The trigger moves once the census is set (from the pending notice to below
  // the summary), so the button the dialog opened from is gone when it closes.
  // Point focus at whichever trigger is mounted instead.
  const triggerEl = useRef<HTMLButtonElement | null>(null)
  const setTriggerRef = useCallback(
    (el: HTMLButtonElement | null) => {
      triggerEl.current = el
      triggerRef?.(el)
    },
    [triggerRef]
  )

  // The saved settings were validated against the group and the chosen details
  // of that moment; this re-checks them whenever either changes.
  // Same cache as the dialog's own check, so an unchanged census costs nothing.
  const savedCheck = useCensusCheck(buildCensusSpec({ groupId, anonymousVoting, weightedVote, census }), {
    enabled: !!census && !!groupId,
  })

  const handleSave = (next: Census) => {
    // The dialog doubles as the "Edit" entry point, so a save that changes
    // nothing must not report a fresh configuration.
    const changed = !census || censusConfigSignature(census) !== censusConfigSignature(next)
    setValue('census', next, { shouldDirty: true, shouldValidate: true })
    if (changed) {
      trackAnalyticsEvent({
        name: AnalyticsEvents.CensusConfigured,
        props: {
          auth_fields_count: countedCredentials(next.credentials),
          password: next.credentials.includes(PASSWORD_CREDENTIAL),
          two_fa: next.use2FA,
          two_fa_method: next.use2FA ? next.use2FAMethod : 'none',
        },
      })
    }
    // A blocked publish may still be saying authentication is missing.
    toast.close(CENSUS_SETUP_TOAST_ID)
    toast({
      title: t('voter_auth.saved', { defaultValue: 'Sign-in settings saved' }),
      type: 'success',
      duration: 3000,
      isClosable: true,
    })
    onClose()
  }

  // Long labels (in some languages) wrap instead of overflowing the sidebar.
  const trigger = (
    <Dialog.Trigger asChild>
      {/* Once configured, editing is secondary to the summary above it. */}
      <Button
        ref={setTriggerRef}
        disabled={!groupId}
        colorPalette='gray'
        w={census ? 'auto' : 'full'}
        variant={census ? 'outline' : 'solid'}
        size={census ? 'sm' : 'md'}
        alignSelf={census ? 'start' : undefined}
        multiline
      >
        {census ? (
          <Trans i18nKey='voter_auth.button.edit'>Edit Voter Authentication</Trans>
        ) : (
          <Trans i18nKey='voter_auth.button.configure'>Configure Voter Authentication</Trans>
        )}
      </Button>
    </Dialog.Trigger>
  )

  return (
    <Dialog.Root
      open={isOpen}
      finalFocusEl={() => triggerEl.current}
      onOpenChange={(details) => (details.open ? onOpen() : onClose())}
      size={{ base: 'full', md: 'xl' }}
      placement='center'
      scrollBehavior='inside'
      // Mounted only while open: closing the dialog discards unsaved edits,
      // and the next opening starts again from the saved settings.
      lazyMount
      unmountOnExit
    >
      {/* A picked group reads as a finished census, so the step still owed is
          spelled out until it's done, and turns into an error once a publish
          has been blocked on it. The status role keeps the pending notice from
          interrupting a screen reader; the error one should. */}
      {isPending && (
        <Alert.Root status={censusError ? 'error' : 'warning'} role={censusError ? 'alert' : 'status'}>
          <Alert.Indicator>
            <LuKeyRound />
          </Alert.Indicator>
          <Alert.Content>
            <Alert.Title>
              {censusError
                ? t('voter_auth.pending.error_title', { defaultValue: 'You need this to publish' })
                : t('voter_auth.pending.title', { defaultValue: 'Required before publishing' })}
            </Alert.Title>
            <Alert.Description>
              {t('voter_auth.pending.description', {
                defaultValue: 'Pick the member details voters must enter to vote, like their ID or member number.',
              })}
            </Alert.Description>
            <Flex mt={3}>{trigger}</Flex>
          </Alert.Content>
        </Alert.Root>
      )}
      {census && <AuthSummary census={census} anonymousVoting={anonymousVoting} checkStatus={savedCheck.status} />}
      {!isPending && trigger}
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          {/* The phone-sized 'full' variant sets these; undo them from md up or
              the desktop dialog stretches to the whole viewport height. */}
          <Dialog.Content
            maxW={{ md: '52rem' }}
            minH={{ md: 'auto' }}
            borderRadius={{ md: 'l3' }}
            mx={{ md: 4 }}
            overflow='hidden'
          >
            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
            <VoterAuthForm census={census ?? lastCensus.current} group={group} onCancel={onClose} onSave={handleSave} />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
      {!groupId && (
        <Text color='fg.muted' fontSize='xs'>
          {t('voter_auth.no_group_description', {
            defaultValue: 'Please select a group first to configure authentication.',
          })}
        </Text>
      )}
    </Dialog.Root>
  )
}
