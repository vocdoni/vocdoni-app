import { Button, Card, VisuallyHidden } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ReceiptCodes, type ReceiptCode } from '~components/ui/ReceiptCodes'
import { CopyIcon, DownloadFileIcon } from '~theme/icons'
import { useVoterFlow } from '../flow-context'
import { textOf } from '../format'
import { downloadText, receiptClipboardText, receiptText, verifyUrlFor, type ReceiptEntry } from '../receipt'

const COPIED_MS = 2500

/** "Copia els codis" and "Baixa'ls": the anonymous receipt's way out, as the platform cannot show it again. */
const ReceiptActions = ({ entries }: { entries: ReceiptEntry[] }) => {
  const { t } = useTranslation()
  const { election } = useVoterFlow()
  const [outcome, setOutcome] = useState<'copied' | 'failed'>()
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    let result: 'copied' | 'failed' = 'copied'
    try {
      await navigator.clipboard.writeText(receiptClipboardText(entries))
    } catch {
      result = 'failed'
    }
    setOutcome(result)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOutcome(undefined), COPIED_MS)
  }
  const download = () =>
    downloadText(
      `${t('voter.receipt.file_name')}.txt`,
      receiptText(textOf(election.title as Parameters<typeof textOf>[0]), entries)
    )

  return (
    <Card.Footer>
      <Button type='button' variant='outline' size='ballot-sm' onClick={copy}>
        <CopyIcon aria-hidden />
        {outcome === 'failed'
          ? t('voter.receipt.copy_failed')
          : outcome === 'copied'
            ? t('voter.receipt.copied')
            : t('voter.receipt.copy')}
      </Button>
      <Button type='button' variant='outline' size='ballot-sm' onClick={download}>
        <DownloadFileIcon aria-hidden />
        {t('voter.receipt.download')}
      </Button>
      {/* The confirmation is announced politely; the region stays mounted so the change is read. */}
      <VisuallyHidden role='status'>
        {outcome === 'failed'
          ? t('voter.receipt.copy_failed_announce')
          : outcome === 'copied'
            ? t('voter.receipt.copied_announce')
            : ''}
      </VisuallyHidden>
    </Card.Footer>
  )
}

/**
 * "El teu comprovant": one row per question with its vote id (shortened, in full on hover) as a link to that vote's
 * page on the Explorer of the vote's own chain (ruling R7); a chain with no explorer leaves the id unlinked. Kept out of
 * session replays. Nothing when the voter holds no id. `anonymous`: the census cannot show the receipt again, so the
 * card says so in its note and offers to copy or download the codes.
 */
export const ReceiptCard = ({ anonymous = false }: { anonymous?: boolean }) => {
  const { t } = useTranslation()
  const { election, voteIds } = useVoterFlow()
  const held = election.questions.filter((question) => voteIds[question.id])
  const entries: ReceiptEntry[] = held.map((question) => ({
    title: textOf(question.title as Parameters<typeof textOf>[0]),
    code: voteIds[question.id],
    url: verifyUrlFor(election.chainId, voteIds[question.id]),
  }))
  const items: ReceiptCode[] = held.map((question, index) => ({
    id: question.id,
    title: entries[index].title,
    voteId: entries[index].code,
    href: entries[index].url,
  }))
  if (!items.length) return null

  return (
    <Card.Root variant='ballot' mt={anonymous ? '4' : '6'} className='ph-no-capture'>
      <Card.Header gap='0'>
        <Card.Title>{t('voter.receipt.card_title')}</Card.Title>
        <Card.Description textStyle='body' color='fg.subtle'>
          {anonymous
            ? t('voter.receipt.card_note_anonymous', { count: items.length })
            : t('voter.receipt.card_note', { count: items.length })}
        </Card.Description>
      </Card.Header>
      <ReceiptCodes items={items} />
      {anonymous && <ReceiptActions entries={entries} />}
    </Card.Root>
  )
}
