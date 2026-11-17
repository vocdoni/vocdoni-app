import { Card, Link, Text } from '@chakra-ui/react'
import { Trans, useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'
import { ReceiptCodes, type ReceiptCode } from '~components/ui/ReceiptCodes'
import { useAppEnv } from '~src/app-env'
import { getVocdoniClientConfig } from '~src/providers/vocdoni-client-config'
import { useVoterFlow } from '../flow-context'
import { textOf } from '../format'

/**
 * "El teu comprovant": one row per question with its vote id (shortened, in full on hover, copied on click) and the
 * Explorer where a voter checks it. Kept out of session replays. Nothing when the voter holds no id.
 */
export const ReceiptCard = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const { election, voteIds } = useVoterFlow()
  const { VOCDONI_ENVIRONMENT } = useAppEnv()
  const explorerUrl = getVocdoniClientConfig(VOCDONI_ENVIRONMENT).explorerUrl ?? 'https://explorer.vote'
  const items: ReceiptCode[] = election.questions
    .filter((question) => voteIds[question.id])
    .map((question) => ({
      id: question.id,
      title: textOf(question.title as Parameters<typeof textOf>[0]),
      voteId: voteIds[question.id],
    }))
  if (!items.length) return null
  const verifyUrl = items.length === 1 ? `${explorerUrl}/verify/${items[0].voteId}` : `${explorerUrl}/verify`

  const copy = (item: ReceiptCode) => {
    void navigator.clipboard
      ?.writeText(item.voteId)
      .then(() => toast({ title: t('voter.receipt.copied'), type: 'success', duration: 3000, isClosable: true }))
  }

  return (
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
        <Trans
          i18nKey='voter.receipt.verify'
          count={items.length}
          components={{ explorer: <Link href={verifyUrl} target='_blank' rel='noopener noreferrer' /> }}
        />
      </Text>
    </>
  )
}
