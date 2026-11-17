import { Card } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { ReceiptCodes, type ReceiptCode } from '~components/ui/ReceiptCodes'
import { useAppEnv } from '~src/app-env'
import { getVocdoniClientConfig } from '~src/providers/vocdoni-client-config'
import { useVoterFlow } from '../flow-context'
import { textOf } from '../format'

/**
 * "El teu comprovant": one row per question with its vote id (shortened, in full on hover) as a link to that vote's
 * page on the Explorer (ruling R7). Kept out of session replays. Nothing when the voter holds no id.
 */
export const ReceiptCard = () => {
  const { t } = useTranslation()
  const { election, voteIds } = useVoterFlow()
  const { VOCDONI_ENVIRONMENT } = useAppEnv()
  const explorerUrl = getVocdoniClientConfig(VOCDONI_ENVIRONMENT).explorerUrl ?? 'https://explorer.vote'
  const items: ReceiptCode[] = election.questions
    .filter((question) => voteIds[question.id])
    .map((question) => ({
      id: question.id,
      title: textOf(question.title as Parameters<typeof textOf>[0]),
      voteId: voteIds[question.id],
      href: `${explorerUrl}/verify/${voteIds[question.id]}`,
    }))
  if (!items.length) return null

  return (
    <Card.Root variant='ballot' mt='6' className='ph-no-capture'>
      <Card.Header gap='0'>
        <Card.Title textStyle='ballot-body' fontWeight='semibold'>
          {t('voter.receipt.card_title')}
        </Card.Title>
        <Card.Description textStyle='body' color='fg.subtle'>
          {t('voter.receipt.card_note', { count: items.length })}
        </Card.Description>
      </Card.Header>
      <ReceiptCodes items={items} />
    </Card.Root>
  )
}
