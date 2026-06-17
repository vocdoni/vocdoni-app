import {
  Box,
  chakra,
  FieldRoot as FormControl,
  FieldErrorText as FormErrorMessage,
  HStack,
  Icon,
  IconButton,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuChevronDown, LuVideo, LuX } from 'react-icons/lu'
import ReactPlayer from 'react-player'
import { SubscriptionLockedContent } from '~components/Layout/SubscriptionLockedContent'
import { SubscriptionPermission } from '~constants'
import { EASE } from './VoterAuthentication/motion'
import type { Process } from './common'

export const LiveStreamingInput = () => {
  const { t } = useTranslation()
  const methods = useFormContext<Process>()
  const { errors } = methods.formState
  const streamUri = methods.watch('streamUri')
  const [open, setOpen] = useState(!!streamUri)

  return (
    <Box>
      {/* Disclosure trigger — accessible name kept as "Attach video (optional)" */}
      <chakra.button
        type='button'
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        display='inline-flex'
        alignItems='center'
        gap={2}
        py={1}
        color={open || streamUri ? 'texts.primary' : 'texts.subtle'}
        fontSize='sm'
        css={{ transition: `color 0.15s ${EASE}` }}
        _hover={{ color: 'texts.primary' }}
      >
        <Icon as={LuVideo} boxSize={4} />
        <Text as='span'>
          {t('process_create.youtube.accordion_title', { defaultValue: 'Attach video (optional)' })}
        </Text>
        <Icon
          as={LuChevronDown}
          boxSize={4}
          css={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: `transform 0.2s ${EASE}` }}
        />
      </chakra.button>

      <Box
        overflow='hidden'
        css={{
          maxHeight: open ? '640px' : '0px',
          opacity: open ? 1 : 0,
          transition: `max-height 0.3s ${EASE}, opacity 0.2s ${EASE}`,
        }}
      >
        <Box pt={3}>
          <SubscriptionLockedContent permissionType={SubscriptionPermission.LiveStreaming}>
            {({ isLocked }) => (
              <VStack align='stretch' gap={3}>
                <FormControl invalid={!!errors.streamUri}>
                  <Controller
                    control={methods.control}
                    name='streamUri'
                    rules={{
                      pattern: {
                        value: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/).+$/,
                        message: t('form.error.invalid_youtube_url', {
                          defaultValue: 'Please enter a valid YouTube URL',
                        }),
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
                  <FormErrorMessage>{errors.streamUri?.message?.toString()}</FormErrorMessage>
                </FormControl>

                {streamUri && (
                  <Box borderWidth='1px' borderColor='table.border' borderRadius='xl' overflow='hidden' bg='auth.bg'>
                    <HStack justify='space-between' px={3} py={2} borderBottomWidth='1px' borderColor='table.border'>
                      <Text fontSize='xs' color='texts.subtle'>
                        <Trans i18nKey='process_create.youtube.preview'>Preview</Trans>
                      </Text>
                      <IconButton
                        size='xs'
                        variant='ghost'
                        color='texts.subtle'
                        aria-label={t('process_create.youtube.remove', { defaultValue: 'Remove video' })}
                        onClick={() => methods.setValue('streamUri', '', { shouldDirty: true, shouldValidate: true })}
                        _hover={{ color: 'red.500', bg: 'red.50' }}
                      >
                        <Icon as={LuX} />
                      </IconButton>
                    </HStack>
                    <Box css={{ aspectRatio: '16 / 9' }} w='full'>
                      <ReactPlayer src={streamUri} controls width='100%' height='100%' />
                    </Box>
                  </Box>
                )}
              </VStack>
            )}
          </SubscriptionLockedContent>
        </Box>
      </Box>
    </Box>
  )
}
