import { Box, Button, Flex, Icon, VisuallyHidden } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LuCheck, LuCopy } from 'react-icons/lu'
import { formatReference } from '~queries/certificateAuth/types'
import { Small } from './kit'
import { useCopy } from './useCopy'

type ReferenceLineProps = {
  /** The raw diagnostic id string (32+ hex chars). Renders nothing when it cannot be parsed. */
  reference: string
}

/** Shows the first 12 hex digits of a diagnostic id, grouped for readability, with a Copy button. */
export const ReferenceLine = ({ reference }: ReferenceLineProps) => {
  const { t } = useTranslation()
  const ref = formatReference(reference)
  const { result, copy } = useCopy(ref?.copy ?? '')

  // Push the compact reference prefix to Crisp so support can find the backend log.
  useEffect(() => {
    if (!ref || typeof window === 'undefined') return
    const crisp = (window as typeof window & { $crisp?: unknown[] }).$crisp
    if (!Array.isArray(crisp)) return
    crisp.push(['set', 'session:data', [[[`certificate_reference`, ref.copy]]]])
  }, [ref])

  if (!ref) return null

  return (
    <Box>
      <Flex align='center' gap={2} wrap='wrap'>
        <Small color='fg.muted'>
          {t('cert_auth.reference.label', { defaultValue: 'Reference code:' })}{' '}
          <Box as='span' fontFamily='mono' letterSpacing='wide' wordSpacing='0.2em' userSelect='all' color='fg'>
            {ref.shown}
          </Box>
        </Small>
        <Button
          size='xs'
          variant='ghost'
          onClick={copy}
          minH={6}
          px={2}
          color='fg.muted'
          aria-label={t('cert_auth.reference.copy', { defaultValue: 'Copy' })}
        >
          <Icon as={result === 'copied' ? LuCheck : LuCopy} aria-hidden />
          {result === 'copied'
            ? t('cert_auth.reference.copied', { defaultValue: 'Copied' })
            : t('cert_auth.reference.copy', { defaultValue: 'Copy' })}
        </Button>
      </Flex>
      {/* Present and empty from the first render so changes are announced. Visible only on failure. */}
      {result === 'failed' ? (
        <Small role='status' color='fg.error'>
          {t('cert_auth.reference.failed', { defaultValue: "Couldn't copy. Select the code and copy it." })}
        </Small>
      ) : (
        <VisuallyHidden role='status'>
          {result === 'copied' ? t('cert_auth.reference.copied_sr', { defaultValue: 'Reference code copied' }) : ''}
        </VisuallyHidden>
      )}
    </Box>
  )
}
