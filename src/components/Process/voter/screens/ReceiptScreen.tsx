import { Box, Card, Link, Text } from '@chakra-ui/react'
import { Trans, useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'
import { ReceiptCodes, type ReceiptCode } from '~components/ui/ReceiptCodes'
import { SuccessDisc } from '~components/ui/SuccessDisc'
import { useAppEnv } from '~src/app-env'
import { getVocdoniClientConfig } from '~src/providers/vocdoni-client-config'
import { useVoterFlow } from '../flow-context'
import { textOf } from '../format'
import { ResultsLine } from '../parts/ResultsLine'
import { ScreenHeading, ScreenHelp, VoterScreenFrame } from '../parts/ScreenParts'

/**
 * Receipt (board V4VoterWide 10, without the voter's name): the vote landed, its codes, and when the results come.
 * Each code links to the same per-vote verify URL the old success dialog built (ruling R7). The anonymous census's
 * one-time warning stays here (audit F6).
 */
export const ReceiptScreen = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const { VOCDONI_ENVIRONMENT } = useAppEnv()
  const { election, voteIds, anonymous, moved } = useVoterFlow()
  const explorerUrl = getVocdoniClientConfig(VOCDONI_ENVIRONMENT).explorerUrl ?? 'https://explorer.vote'
  const items: ReceiptCode[] = election.questions
    .filter((question) => voteIds[question.id])
    .map((question) => ({
      id: question.id,
      title: textOf(question.title as Parameters<typeof textOf>[0]),
      voteId: voteIds[question.id],
    }))
  const verifyUrl = (item: ReceiptCode) => `${explorerUrl}/verify/${item.voteId}`

  const copy = (item: ReceiptCode) => {
    void navigator.clipboard
      ?.writeText(item.voteId)
      .then(() => toast({ title: t('voter.receipt.copied'), type: 'success', duration: 3000, isClosable: true }))
  }

  return (
    <VoterScreenFrame kind='receipt' privateContent>
      {/* data-testid: the e2e cast helper waits for this, as it did for the old success dialog. */}
      <Box data-testid='vote-receipt'>
        <SuccessDisc />
        <ScreenHeading focus={moved} mt='5'>
          {t('voter.receipt.title')}
        </ScreenHeading>
        <ScreenHelp>{t('voter.receipt.help', { count: election.questions.length })}</ScreenHelp>
        {items.length > 0 && (
          <>
            <Card.Root variant='ballot' mt='6' className='ph-no-capture'>
              <Card.Header>
                <Card.Title textStyle='ballot-body' fontWeight='semibold'>
                  {t('voter.receipt.card_title')}
                </Card.Title>
                <Card.Description textStyle='body' color='fg.subtle'>
                  {t('voter.receipt.card_note', { count: items.length })}
                </Card.Description>
              </Card.Header>
              <ReceiptCodes
                items={items}
                onCopy={copy}
                copyLabel={(item) => t('voter.receipt.copy', { question: String(item.title) })}
              />
            </Card.Root>
            <Text as='p' textStyle='ballot-hint' color='fg.muted' mt='3.5'>
              {items.length === 1 ? (
                <Trans
                  i18nKey='voter.receipt.verify'
                  count={1}
                  components={{
                    explorer: <Link href={verifyUrl(items[0])} target='_blank' rel='noopener noreferrer' />,
                  }}
                />
              ) : (
                <Trans
                  i18nKey='voter.receipt.verify'
                  count={items.length}
                  components={{ explorer: <Text as='span' fontWeight='semibold' /> }}
                />
              )}
            </Text>
            {items.length > 1 && (
              <Box as='ul' role='list' textStyle='ballot-hint' mt='1.5' className='ph-no-capture'>
                {items.map((item) => (
                  <li key={item.id}>
                    <Link href={verifyUrl(item)} target='_blank' rel='noopener noreferrer' color='accent.fg'>
                      {item.title}
                    </Link>
                  </li>
                ))}
              </Box>
            )}
          </>
        )}
        {anonymous && items.length > 0 && (
          <Text as='p' textStyle='ballot-hint' fontWeight='semibold' mt='3.5'>
            {t('vote.anonymous_receipt')}
          </Text>
        )}
        <ResultsLine />
      </Box>
    </VoterScreenFrame>
  )
}
