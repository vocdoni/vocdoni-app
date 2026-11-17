import { Box, Card, Flex, Heading, Icon, IconButton, Input, Text, VisuallyHidden, useClipboard } from '@chakra-ui/react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckIcon, CopyIcon } from '~theme/icons'
import type { VoteState } from '~utils/vote-state'

type SummaryShareProps = {
  /** The public voting page. */
  link: string
  state: VoteState
}

/**
 * "Per compartir": the link to the digital ballot box, to copy and send to the eligible voters. Once the vote is
 * closed the link leads to its results, and a canceled vote has nothing to share.
 */
export const SummaryShare = ({ link, state }: SummaryShareProps) => {
  const { t } = useTranslation()
  const titleId = useId()
  const { copy, copied } = useClipboard({ value: link })

  if (state === 'canceled') return null

  const copyLabel = t('votes.summary.copy_link', { defaultValue: 'Copy the public link' })

  return (
    <Card.Root variant='frame' as='section' aria-labelledby={titleId}>
      <Card.Body pt={{ base: '3.5', lg: '3' }} pb={{ base: '4', md: '5', lg: '4.5' }} gap='3'>
        <Box>
          <Heading as='h2' id={titleId} textStyle='section-title'>
            {t('votes.summary.share_title', { defaultValue: 'To share' })}
          </Heading>
          <Text mt={{ base: '1.5', lg: '0.5' }} textStyle={{ base: 'body', lg: 'body-sm' }} color='fg.subtle'>
            {state === 'closed'
              ? t('votes.summary.share_note_closed', {
                  defaultValue: 'Link to the public page of the vote, with its results.',
                })
              : t('votes.summary.share_note', {
                  defaultValue: 'Link to the digital ballot box. Share it with the eligible voters.',
                })}
          </Text>
        </Box>
        <Flex gap='2' maxW={{ md: 'lg', lg: 'full' }}>
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
          <IconButton variant='outline' onClick={copy} aria-label={copyLabel} title={copyLabel}>
            <Icon as={copied ? CheckIcon : CopyIcon} />
          </IconButton>
        </Flex>
      </Card.Body>
    </Card.Root>
  )
}
