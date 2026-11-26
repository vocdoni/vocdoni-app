import { Button, Field, Input, chakra } from '@chakra-ui/react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLinkIcon } from '~theme/icons'
import { useVoterFlow } from '../flow-context'
import { ScreenHeading, ScreenHelp, ScreenHint, VoterScreenFrame } from '../parts/ScreenParts'
import { VoterActionBar } from '../parts/VoterActionBar'
import { VoteClosedLine, VoteStatusLine } from '../parts/VoteStatusLine'
import { checkReceiptCode, hasExplorerFor, verifyUrlFor, type ReceiptCodeCheck } from '../receipt'
import { isVoteOver } from '../voter-flow'

/**
 * "Verifica el teu comprovant" (boards V4VoterWideMore 14 and 14b), for an anonymous census: one receipt code, checked
 * on the Explorer in a new tab. Nobody is identified, so it works on any device and after the vote ends. A code that
 * is not 64 hex characters gets its error under the field and keeps the focus there.
 */
export const VerifyReceiptScreen = () => {
  const { t } = useTranslation()
  const { election, facts, moved, verifyReceipt } = useVoterFlow()
  // A chain with no Explorer has nowhere to check a code: no field, no hint and no submit.
  const hasExplorer = hasExplorerFor(election.chainId)
  const formId = useId()
  const errorId = useId()
  const input = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [problem, setProblem] = useState<Extract<ReceiptCodeCheck, { ok: false }>['reason'] | null>(null)
  // Until hydration a click would submit the form natively: the button stays off until React owns it.
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const result = checkReceiptCode(value)
    if (result.ok === false) {
      setProblem(result.reason)
      input.current?.focus()
      return
    }
    const url = verifyUrlFor(election.chainId, result.code)
    if (url) window.open(url, '_blank', 'noopener')
  }

  return (
    <VoterScreenFrame kind='verifyReceipt'>
      {isVoteOver(facts) ? <VoteClosedLine /> : <VoteStatusLine />}
      <ScreenHeading focus={moved} mt='2.5'>
        {t('voter.verify.title')}
      </ScreenHeading>
      {hasExplorer ? (
        <>
          <ScreenHelp>{t('voter.verify.help')}</ScreenHelp>
          <chakra.form id={formId} method='post' noValidate onSubmit={onSubmit} mt='7'>
            <Field.Root size='ballot' invalid={problem !== null}>
              <Field.Label>{t('voter.verify.field_label')}</Field.Label>
              <Input
                ref={input}
                size='ballot'
                name='code'
                aria-describedby={problem ? errorId : undefined}
                value={value}
                onChange={(event) => {
                  setValue(event.target.value)
                  setProblem(null)
                }}
                autoComplete='off'
                autoCapitalize='off'
                autoCorrect='off'
                spellCheck={false}
                // The code is read as a figure: the monospace face at 14px, with no tracking.
                fontFamily='figure'
                fontSize='sm'
                letterSpacing='none'
              />
              {problem && (
                <Field.ErrorText id={errorId}>
                  {problem === 'incomplete' ? t('voter.verify.error_incomplete') : t('voter.verify.error_format')}
                </Field.ErrorText>
              )}
            </Field.Root>
          </chakra.form>
          <ScreenHint>{t('voter.verify.hint')}</ScreenHint>
        </>
      ) : null}
      <VoterActionBar
        secondary={
          <Button variant='outline' size='ballot' onClick={() => verifyReceipt(false)}>
            {t('voter.back')}
          </Button>
        }
        primary={
          hasExplorer ? (
            <Button type='submit' form={formId} size='ballot' disabled={!hydrated}>
              {t('voter.verify.submit')}
              <ExternalLinkIcon aria-hidden />
            </Button>
          ) : undefined
        }
      />
    </VoterScreenFrame>
  )
}
