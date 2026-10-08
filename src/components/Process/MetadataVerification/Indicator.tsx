import { Box, Button, Flex, Icon, Popover, Portal, Spinner, Text } from '@chakra-ui/react'
import type { IconType } from 'react-icons'
import { useTranslation } from 'react-i18next'
import { RiQuestionLine, RiShieldCheckLine, RiShieldCrossLine, RiShieldLine } from 'react-icons/ri'
import { useMetadataVerificationContext } from './context'
import type { ContentField, FieldCheck, HashCheck } from './verify'

const STATUS_STYLE: Record<HashCheck, { icon: IconType; color: string }> = {
  verified: { icon: RiShieldCheckLine, color: 'green.600' },
  mismatch: { icon: RiShieldCrossLine, color: 'red.600' },
  unverifiable: { icon: RiQuestionLine, color: 'texts.subtle' },
  'no-hash': { icon: RiShieldLine, color: 'texts.subtle' },
}

const useStatusLabels = () => {
  const { t } = useTranslation()

  const headline: Record<HashCheck, string> = {
    verified: t('process.verification.status.verified', { defaultValue: 'Content verified' }),
    mismatch: t('process.verification.status.mismatch', { defaultValue: 'Content does not match' }),
    unverifiable: t('process.verification.status.unverifiable', { defaultValue: 'Content not verifiable' }),
    'no-hash': t('process.verification.status.no_hash', { defaultValue: 'No content hash on chain' }),
  }

  const description: Record<HashCheck, string> = {
    verified: t('process.verification.description.verified', {
      defaultValue: 'What this page shows matches, byte for byte, the version the organizer committed on the Vochain.',
    }),
    mismatch: t('process.verification.description.mismatch', {
      defaultValue:
        'Part of what this page shows does not match the version committed on the Vochain. Contact the organizer before voting.',
    }),
    unverifiable: t('process.verification.description.unverifiable', {
      defaultValue: 'Your browser could not check this content against the Vochain.',
    }),
    'no-hash': t('process.verification.description.no_hash', {
      defaultValue: 'This vote was published without a content hash on the Vochain, so its content cannot be checked.',
    }),
  }

  const item: Record<HashCheck, string> = {
    verified: t('process.verification.item.verified', { defaultValue: 'Verified' }),
    mismatch: t('process.verification.item.mismatch', { defaultValue: 'Does not match' }),
    unverifiable: t('process.verification.item.unverifiable', { defaultValue: 'Not verifiable' }),
    'no-hash': t('process.verification.item.no_hash', { defaultValue: 'No hash' }),
  }

  return { headline, description, item }
}

const mediaName = (url: string) => {
  try {
    const { hostname, pathname } = new URL(url)
    return pathname.split('/').filter(Boolean).pop() || hostname
  } catch {
    return url
  }
}

const useFieldLabel = () => {
  const { t } = useTranslation()

  return ({ field, choice }: FieldCheck) => {
    const number = (choice ?? 0) + 1
    const labels: Record<ContentField, string> = {
      'process-title': t('process.verification.field.process_title', { defaultValue: 'Vote title' }),
      'process-description': t('process.verification.field.process_description', {
        defaultValue: 'Vote description',
      }),
      'question-title': t('process.verification.field.question_title', { defaultValue: 'Question' }),
      'question-description': t('process.verification.field.question_description', {
        defaultValue: 'Question description',
      }),
      choices: t('process.verification.field.choices', { defaultValue: 'Number of options' }),
      'choice-title': t('process.verification.field.choice_title', {
        number,
        defaultValue: 'Option {{number}} text',
      }),
      'choice-value': t('process.verification.field.choice_value', {
        number,
        defaultValue: 'Option {{number}} value',
      }),
      'choice-description': t('process.verification.field.choice_description', {
        number,
        defaultValue: 'Option {{number}} description',
      }),
      'choice-image': t('process.verification.field.choice_image', {
        number,
        defaultValue: 'Option {{number}} image',
      }),
      header: t('process.verification.field.header', { defaultValue: 'Header image' }),
      stream: t('process.verification.field.stream', { defaultValue: 'Video' }),
      organization: t('process.verification.field.organization', { defaultValue: 'Organization' }),
      'question-list': t('process.verification.field.question_list', { defaultValue: 'Question list' }),
    }
    return labels[field]
  }
}

const Row = ({
  label,
  title,
  status,
  nested,
}: {
  label: string
  title?: string
  status: HashCheck
  nested?: boolean
}) => {
  const { item } = useStatusLabels()
  const { icon, color } = STATUS_STYLE[status]

  return (
    <Flex
      justifyContent='space-between'
      alignItems='center'
      gap={3}
      fontSize={nested ? 'xs' : 'sm'}
      ps={nested ? 3 : 0}
    >
      <Text truncate title={title ?? label}>
        {label}
      </Text>
      <Flex alignItems='center' gap={1} color={color} flexShrink={0}>
        <Icon as={icon} />
        <Text>{item[status]}</Text>
      </Flex>
    </Flex>
  )
}

/**
 * Small indicator of the browser-side check of the ballot content against the hashes
 * committed on the Vochain, with the per-document and per-media detail in a popover.
 * Renders nothing for a process with no published question.
 */
export const MetadataVerificationIndicator = () => {
  const { t } = useTranslation()
  const verification = useMetadataVerificationContext()
  const { headline, description } = useStatusLabels()
  const fieldLabel = useFieldLabel()

  if (!verification?.enabled) return null
  const { data, pending, failed } = verification

  if (pending) {
    return (
      <Flex alignItems='center' gap={2} fontSize='sm' color='texts.subtle'>
        <Spinner size='xs' />
        <Text>{t('process.verification.checking', { defaultValue: 'Checking content…' })}</Text>
      </Flex>
    )
  }

  const status: HashCheck = failed || !data ? 'unverifiable' : data.status
  const { icon, color } = STATUS_STYLE[status]
  const documents = data?.documents ?? []
  const entries = [
    ...(data
      ? [
          {
            key: 'process',
            label: t('process.verification.process', { defaultValue: 'Vote details' }),
            document: data.process,
          },
        ]
      : []),
    ...documents.map((document, index) => ({
      key: document.electionId ?? String(index),
      label:
        documents.length > 1
          ? t('process.verification.question', { number: index + 1, defaultValue: 'Question {{number}}' })
          : t('process.verification.ballot', { defaultValue: 'Ballot text' }),
      document,
    })),
  ]
  const media = data?.media ?? []
  // A video is never hashed: a verified stream field only vouches for its URL.
  const videoUrlVerified = !!data?.process.fields?.some((f) => f.field === 'stream' && f.status === 'verified')

  return (
    <Popover.Root positioning={{ placement: 'bottom-start' }}>
      <Popover.Trigger asChild>
        <Button variant='ghost' size='xs' alignSelf='start' px={1} color={color} data-status={status}>
          <Icon as={icon} />
          {headline[status]}
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Body display='flex' flexDirection='column' gap={3}>
              <Popover.Title fontWeight='bold'>
                {t('process.verification.title', { defaultValue: 'Content verification' })}
              </Popover.Title>
              <Text fontSize='sm'>{description[status]}</Text>
              {entries.length > 0 && (
                <Box display='flex' flexDirection='column' gap={1}>
                  {entries.map(({ key, label, document }) => (
                    <Box key={key} display='flex' flexDirection='column' gap={1}>
                      <Row label={label} title={document.metadataURL} status={document.status} />
                      {/* Only what did not check out: a verified field is the expected case. */}
                      {document.fields
                        ?.filter((field) => field.status !== 'verified')
                        .map((field) => (
                          <Row
                            key={`${field.field}-${field.choice ?? ''}`}
                            label={fieldLabel(field)}
                            status={field.status}
                            nested
                          />
                        ))}
                    </Box>
                  ))}
                </Box>
              )}
              {media.length > 0 && (
                <Box display='flex' flexDirection='column' gap={1}>
                  <Text fontSize='xs' fontWeight='bold' color='texts.subtle'>
                    {t('process.verification.images', { defaultValue: 'Images' })}
                  </Text>
                  {media.map((medium) => (
                    <Row key={medium.url} label={mediaName(medium.url)} title={medium.url} status={medium.status} />
                  ))}
                </Box>
              )}
              {videoUrlVerified && (
                <Text fontSize='sm'>
                  {t('process.verification.video_url', {
                    defaultValue: 'Video: URL verified; the video content itself is not covered.',
                  })}
                </Text>
              )}
              <Text fontSize='xs' color='texts.subtle'>
                {t('process.verification.footnote', {
                  defaultValue: 'Checked in your browser by hashing the content and comparing it with the Vochain.',
                })}
              </Text>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
}
