import { Button, CloseButton, Dialog, Portal, Text, useDisclosure } from '@chakra-ui/react'
import { useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'
import type { Group } from '~src/queries/groups'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { buildCensusSpec } from '../census-spec'
import { Census, Process } from '../common'
import { AuthSummary } from './AuthSummary'
import { useCensusCheck } from './useCensusCheck'
import { censusConfigSignature } from './utils'
import { VoterAuthForm } from './VoterAuthForm'

export const VoterAuthentication = ({ group }: { group?: Group | null }) => {
  const { t } = useTranslation()
  const toast = useToast()
  const { watch, setValue } = useFormContext<Process>()
  const { open: isOpen, onOpen, onClose } = useDisclosure()

  const [groupId, census, anonymousVoting, weightedVote] = watch([
    'groupId',
    'census',
    'anonymousVoting',
    'weightedVote',
  ])

  // The saved settings were validated against the group, anonymity and
  // weighting of that moment; this re-checks them whenever any of those change.
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
          auth_fields_count: next.credentials.length,
          two_fa: next.use2FA,
          two_fa_method: next.use2FA ? next.use2FAMethod : 'none',
        },
      })
    }
    toast({
      title: t('voter_auth.saved', { defaultValue: 'Sign-in settings saved' }),
      type: 'success',
      duration: 3000,
      isClosable: true,
    })
    onClose()
  }

  return (
    <>
      {census && <AuthSummary census={census} anonymousVoting={anonymousVoting} checkStatus={savedCheck.status} />}
      <Dialog.Root
        open={isOpen}
        onOpenChange={(details) => (details.open ? onOpen() : onClose())}
        size={{ base: 'full', md: 'xl' }}
        placement='center'
        scrollBehavior='inside'
        // Mounted only while open: closing the dialog discards unsaved edits,
        // and the next opening starts again from the saved settings.
        lazyMount
        unmountOnExit
      >
        <Dialog.Trigger asChild>
          {/* Once configured, editing is secondary to the summary above it. */}
          <Button
            disabled={!groupId}
            colorPalette='gray'
            w={census ? 'auto' : 'full'}
            variant={census ? 'outline' : 'solid'}
            size={census ? 'sm' : 'md'}
            alignSelf={census ? 'start' : undefined}
          >
            {census ? (
              <Trans i18nKey='voter_auth.button.edit'>Edit Voter Authentication</Trans>
            ) : (
              <Trans i18nKey='voter_auth.button.configure'>Configure Voter Authentication</Trans>
            )}
          </Button>
        </Dialog.Trigger>
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
              <VoterAuthForm census={census} group={group} onCancel={onClose} onSave={handleSave} />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
      {!groupId && (
        <Text color='fg.muted' fontSize='xs'>
          {t('voter_auth.no_group_description', {
            defaultValue: 'Please select a group first to configure authentication.',
          })}
        </Text>
      )}
    </>
  )
}
