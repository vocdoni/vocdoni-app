import { Button, Icon, VisuallyHidden } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuCheck, LuCopy } from 'react-icons/lu'
import { Small } from './kit'
import { useCopy } from './useCopy'

const actionButton = { size: 'lg', whiteSpace: 'normal', h: 'auto', minH: 12, py: 3 } as const

/** Copies the clean process URL (origin + pathname, no query or fragment) to the clipboard. */
export const CopyLinkButton = () => {
  const { t } = useTranslation()
  const url = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''
  const { result, copy } = useCopy(url)

  return (
    <>
      <Button {...actionButton} variant='outline' onClick={copy}>
        <Icon as={result === 'copied' ? LuCheck : LuCopy} boxSize={5} aria-hidden />
        {result === 'copied'
          ? t('cert_auth.actions.link_copied', { defaultValue: 'Link copied' })
          : t('cert_auth.actions.copy_link', { defaultValue: 'Copy link for another device' })}
      </Button>
      {result === 'failed' ? (
        <Small role='status' color='fg.error' flexBasis='100%'>
          {t('cert_auth.actions.copy_link_failed', {
            defaultValue: "Couldn't copy. Copy the address from your browser's address bar.",
          })}
        </Small>
      ) : (
        <VisuallyHidden role='status'>
          {result === 'copied' ? t('cert_auth.actions.link_copied', { defaultValue: 'Link copied' }) : ''}
        </VisuallyHidden>
      )}
    </>
  )
}
