import { Card } from '@chakra-ui/react'
import { explorerVoteUrl } from '@vocdoni/api-client'
import { useTranslation } from 'react-i18next'
import { ReceiptCodes, type ReceiptCode } from '~components/ui/ReceiptCodes'
import { useVoterFlow } from '../flow-context'
import { textOf } from '../format'

/**
 * "El teu comprovant": one row per question with its vote id (shortened, in full on hover) as a link to that vote's
 * page on the Explorer of the vote's own chain (ruling R7); a chain with no explorer leaves the id unlinked. Kept out of
 * session replays. Nothing when the voter holds no id.
 */
export const ReceiptCard = () => {
  const { t } = useTranslation()
  const { election, voteIds } = useVoterFlow()
  const items: ReceiptCode[] = election.questions
    .filter((question) => voteIds[question.id])
    .map((question) => ({
      id: question.id,
      title: textOf(question.title as Parameters<typeof textOf>[0]),
      voteId: voteIds[question.id],
      href: explorerVoteUrl(election.chainId, voteIds[question.id]),
    }))
  if (!items.length) return null

  return (
    <Card.Root variant='ballot' mt='6' className='ph-no-capture'>
      <Card.Header gap='0'>
        <Card.Title>{t('voter.receipt.card_title')}</Card.Title>
        <Card.Description textStyle='body' color='fg.subtle'>
          {t('voter.receipt.card_note', { count: items.length })}
        </Card.Description>
      </Card.Header>
      <ReceiptCodes items={items} />
    </Card.Root>
  )
}
