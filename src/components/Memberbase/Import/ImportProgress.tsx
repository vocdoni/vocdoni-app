import { Box, Button, CloseButton, Dialog, Flex, List, Portal, Progress, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Banner } from '~components/ui/Banner'
import { useImportJob } from './useImportJob'

type ImportProgressProps = {
  jobId: string | null
  /** Closing the banner forgets the job */
  onDismiss: () => void
}

/** The People tab's line about an import still running, or one that ended while the admin was away. */
export const ImportProgress = ({ jobId, onDismiss }: ImportProgressProps) => {
  const { t, i18n } = useTranslation()
  const job = useImportJob(jobId)
  const [showErrors, setShowErrors] = useState(false)

  if (!jobId) return null

  const close = (
    <CloseButton
      size='sm'
      onClick={onDismiss}
      aria-label={t('members.import.banner.dismiss', { defaultValue: 'Dismiss' })}
    />
  )
  const errorCount = job.errors.length

  return (
    <Box mb={4}>
      {job.pending && (
        <Banner status='info' action={close}>
          <Flex direction='column' gap={2}>
            <Text>
              {t('members.import.banner.running', {
                defaultValue: 'Importing your members… You can leave this page: we’ll email you when it’s done.',
              })}
            </Text>
            <Progress.Root
              size='sm'
              value={job.progress}
              maxW='20rem'
              aria-label={t('members.import.banner.label', { defaultValue: 'Import progress' })}
            >
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          </Flex>
        </Banner>
      )}
      {job.completed && !errorCount && (
        <Banner status='success' action={close}>
          {t('members.import.banner.done', {
            count: job.data?.result?.added ?? 0,
            formattedCount: (job.data?.result?.added ?? 0).toLocaleString(i18n.resolvedLanguage),
            defaultValue_one: 'Import finished: {{formattedCount}} member added.',
            defaultValue_other: 'Import finished: {{formattedCount}} members added.',
          })}
        </Banner>
      )}
      {job.completed && errorCount > 0 && (
        <Banner
          status='warning'
          action={
            <Flex gap={2} align='center'>
              <Button size='xs' variant='outline' onClick={() => setShowErrors(true)}>
                {t('members.import.banner.view_errors', {
                  count: errorCount,
                  defaultValue_one: 'See the problem',
                  defaultValue_other: 'See the {{count}} problems',
                })}
              </Button>
              {close}
            </Flex>
          }
        >
          {t('members.import.banner.done_with_errors', {
            count: errorCount,
            defaultValue_one: 'Import finished, but one row had a value we couldn’t use.',
            defaultValue_other: 'Import finished, but {{count}} rows had values we couldn’t use.',
          })}
        </Banner>
      )}
      {job.failed && (
        <Banner status='error' action={close}>
          {t('members.import.banner.failed', {
            defaultValue: 'The import didn’t finish. Try again, or talk to us if it keeps happening.',
          })}
        </Banner>
      )}

      <Dialog.Root size='lg' open={showErrors} onOpenChange={({ open }) => setShowErrors(open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  {t('members.import.banner.errors_title', { defaultValue: 'Import problems' })}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {/* ph-no-capture: import errors quote the values of the offending rows */}
                <List.Root className='ph-no-capture' ps={4} gap={2} fontSize='sm'>
                  {job.errors.map((error, index) => (
                    <List.Item key={index} whiteSpace='pre-wrap'>
                      {error}
                    </List.Item>
                  ))}
                </List.Root>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant='outline'>{t('close', { defaultValue: 'Close' })}</Button>
                </Dialog.ActionTrigger>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size='sm' />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  )
}
