import {
  AccordionItem,
  AccordionItemBody,
  AccordionItemContent,
  AccordionItemIndicator,
  AccordionItemTrigger,
  AccordionRoot,
  Box,
  Input,
  Text,
} from '@chakra-ui/react'
import { Controller, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import ReactPlayer from 'react-player'
import { SubscriptionLockedContent } from '~components/Layout/SubscriptionLockedContent'
import { Field } from '~components/ui/Field'
import { SubscriptionPermission } from '~constants'
import type { Process } from './common'

export const LiveStreamingInput = () => {
  const { t } = useTranslation()
  const methods = useFormContext<Process>()
  const { errors } = methods.formState
  const streamUri = methods.watch('streamUri')

  return (
    <AccordionRoot collapsible>
      <AccordionItem value='live-streaming' border='none'>
        <AccordionItemTrigger px={0}>
          <Box textAlign='left'>
            <Text fontSize='sm' color='texts.subtle'>
              {t('process_create.youtube.accordion_title', {
                defaultValue: 'Attach video (optional)',
              })}
            </Text>
          </Box>
          <AccordionItemIndicator />
        </AccordionItemTrigger>

        <AccordionItemContent>
          <AccordionItemBody px={0} display='flex' flexDirection='column' gap={4}>
            <SubscriptionLockedContent permissionType={SubscriptionPermission.LiveStreaming}>
              {({ isLocked }) => (
                <>
                  <Field
                    invalid={!!errors.streamUri}
                    label={<Trans i18nKey='process_create.youtube.title'>Live streaming video</Trans>}
                    errorText={errors.streamUri?.message?.toString()}
                  >
                    <Controller
                      control={methods.control}
                      name='streamUri'
                      rules={{
                        pattern: {
                          value: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/).+$/,
                          message: t('form.error.invalid_youtube_url', 'Please enter a valid YouTube URL'),
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type='url'
                          placeholder='https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                          tabIndex={isLocked ? -1 : 0}
                        />
                      )}
                    />
                  </Field>
                  {streamUri && <ReactPlayer src={streamUri} controls />}
                </>
              )}
            </SubscriptionLockedContent>
          </AccordionItemBody>
        </AccordionItemContent>
      </AccordionItem>
    </AccordionRoot>
  )
}
