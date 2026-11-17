import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Icon,
  IconButton,
  Input,
  Text,
  useBreakpointValue,
  VisuallyHidden,
  useClipboard,
} from '@chakra-ui/react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckIcon, CopyIcon } from '~theme/icons'
import type { VoteState } from '~utils/vote-state'
import { SummaryCardHeader } from './SummaryCardHeader'

type SummaryShareProps = {
  /** The public voting page. */
  link: string
  desktop: boolean
  state: VoteState
}

/**
 * "Per compartir": the link to the digital ballot box, to copy and send to the eligible voters. Once the vote is
 * closed the link leads to its results, and a canceled vote has nothing to share.
 */
export const SummaryShare = ({ link, desktop, state }: SummaryShareProps) => {
  const { t } = useTranslation()
  const titleId = useId()
  const { copy, copied } = useClipboard({ value: link })
  const tablet = useBreakpointValue({ base: false, md: true, lg: false })

  if (state === 'canceled') return null

  const note =
    state === 'closed'
      ? t('votes.summary.share_note_closed', { defaultValue: 'Link to the public page of the vote, with its results.' })
      : t('votes.summary.share_note', {
          defaultValue: 'Link to the digital ballot box. Share it with the eligible voters.',
        })

  const copyLabel = t('votes.summary.copy_link', { defaultValue: 'Copy the public link' })
  const copyIcon = <Icon as={copied ? CheckIcon : CopyIcon} />
  const row = (
    <Flex gap='2'>
      {/* The swapped icon is all a sighted user gets; a screen reader hears it said. */}
      <VisuallyHidden aria-live='polite'>
        {copied ? t('votes.summary.link_copied', { defaultValue: 'Link copied' }) : ''}
      </VisuallyHidden>
      <Input
        readOnly
        variant='code'
        aria-label={t('voting_link.title', 'Voting Link')}
        // The address without its scheme, as the board prints it; the copy keeps it whole.
        value={link.replace(/^https?:\/\//, '')}
        flex='1'
        minW='0'
      />
      {tablet ? (
        <Button variant='outline' onClick={copy} aria-label={copyLabel}>
          {copyIcon}
          {t('copy.copy', 'Copy')}
        </Button>
      ) : (
        <IconButton variant='outline' onClick={copy} aria-label={copyLabel} title={copyLabel}>
          {copyIcon}
        </IconButton>
      )}
    </Flex>
  )

  if (desktop) {
    return (
      <Card.Root variant='frame' as='section' aria-labelledby={titleId}>
        <Card.Body pt='3' pb='4.5' gap='3'>
          <Box>
            <Heading as='h2' id={titleId} textStyle='section-title'>
              {t('votes.summary.share_title', { defaultValue: 'To share' })}
            </Heading>
            <Text mt='0.5' textStyle='body-sm' color='fg.subtle'>
              {note}
            </Text>
          </Box>
          {row}
        </Card.Body>
      </Card.Root>
    )
  }

  return (
    <Card.Root variant='frame' as='section' aria-labelledby={titleId}>
      <SummaryCardHeader id={titleId} title={t('votes.summary.share_title', { defaultValue: 'To share' })} />
      <Card.Body pt='0' pb={{ base: '4', md: '5' }} gap='3' borderTopWidth='[0]'>
        <Text mt='-1.5' textStyle='body' color='fg.subtle'>
          {note}
        </Text>
        <Box maxW={{ md: 'lg' }}>{row}</Box>
      </Card.Body>
    </Card.Root>
  )
}
