import { Button, Icon, VisuallyHidden } from '@chakra-ui/react'
import type { TFunction } from 'i18next'
import type { ReactNode } from 'react'
import { Trans } from 'react-i18next'
import {
  LuBan,
  LuCalendarClock,
  LuCalendarX,
  LuCircleAlert,
  LuCloudOff,
  LuExternalLink,
  LuIdCard,
  LuRefreshCw,
  LuSearchX,
  LuShieldQuestion,
  LuShieldX,
  LuTimer,
  LuUserX,
  LuWifiOff,
} from 'react-icons/lu'
import type { CertAuthError } from '~queries/certificateAuth/types'
import { CopyLinkButton } from './CopyLinkButton'

export type ErrorSpec = {
  icon: typeof LuUserX
  title: string
  sentence: ReactNode
  primary: ReactNode
  secondary?: ReactNode
  /** Short extra line, only when it changes what the voter should do (e.g. voting closes soon). */
  note?: ReactNode
}

export type ErrorSpecMode = 'vote' | 'check'

type ErrorSpecOptions = {
  t: TFunction
  language: string
  mode: ErrorSpecMode
  /** The process close time, used to show a note when voting ends today or tomorrow. */
  closesAt?: Date
  /** The process open time, used for the still-time note in check mode. */
  opensAt?: Date
  /** Override for the current time, for testing. */
  now?: Date
  /** Restart a fresh certificate attempt. */
  onRetry: () => void
}

const actionButton = { size: 'lg', whiteSpace: 'normal', h: 'auto', minH: 12, py: 3 } as const

const formatDate = (date: Date, language: string) =>
  new Intl.DateTimeFormat(language, { day: 'numeric', month: 'long', year: 'numeric' }).format(date)

const formatTime = (date: Date, language: string) =>
  new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit' }).format(date)

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

const isTomorrow = (target: Date, now: Date) => {
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return isSameDay(target, tomorrow)
}

const closingNote = (t: TFunction, closesAt: Date | undefined, language: string, now: Date): string | undefined => {
  if (!closesAt) return undefined
  if (isSameDay(closesAt, now))
    return t('cert_auth.note.closes_today', {
      defaultValue: 'Voting closes today at {{time}}.',
      time: formatTime(closesAt, language),
    })
  if (isTomorrow(closesAt, now))
    return t('cert_auth.note.closes_tomorrow', {
      defaultValue: 'Voting closes tomorrow at {{time}}.',
      time: formatTime(closesAt, language),
    })
  return undefined
}

const stillTimeNote = (t: TFunction, opensAt: Date | undefined, language: string): string | undefined => {
  if (!opensAt) return undefined
  return t('cert_auth.note.still_time', {
    defaultValue: 'You still have time: voting opens on {{date}}.',
    date: formatDate(opensAt, language),
  })
}

const useDifferentLabel = (t: TFunction, mode: ErrorSpecMode): string =>
  mode === 'check'
    ? t('cert_auth.actions.check_different', { defaultValue: 'Check a different certificate' })
    : t('cert_auth.actions.use_different', { defaultValue: 'Use a different certificate' })

const UseDifferentButton = ({
  t,
  mode,
  onRetry,
  primary,
}: {
  t: TFunction
  mode: ErrorSpecMode
  onRetry: () => void
  primary?: boolean
}) => (
  <Button {...actionButton} variant={primary ? 'solid' : 'outline'} onClick={onRetry}>
    <Icon as={LuIdCard} boxSize={5} aria-hidden />
    {useDifferentLabel(t, mode)}
  </Button>
)

const TryAgainButton = ({ t, onRetry }: { t: TFunction; onRetry: () => void }) => (
  <Button {...actionButton} onClick={onRetry}>
    <Icon as={LuRefreshCw} boxSize={5} aria-hidden />
    {t('cert_auth.actions.try_again', { defaultValue: 'Try again' })}
  </Button>
)

type IssuerSpec = { name: string; href: string }

const ISSUER_LINKS: Record<string, IssuerSpec> = {
  fnmt: { name: 'FNMT', href: 'https://www.sede.fnmt.gob.es/certificados/persona-fisica' },
  idcat: { name: 'idCAT', href: 'https://idcat.aoc.cat/' },
}

const GetNewCertButton = ({ t, issuer }: { t: TFunction; issuer: IssuerSpec }) => (
  <Button {...actionButton} asChild>
    <a href={issuer.href} target='_blank' rel='noopener noreferrer'>
      {t('cert_auth.actions.get_new', { defaultValue: 'Get a new {{issuer}} certificate', issuer: issuer.name })}
      <VisuallyHidden> {t('cert_auth.actions.opens_new_tab', { defaultValue: '(opens in a new tab)' })}</VisuallyHidden>
      <Icon as={LuExternalLink} aria-hidden />
    </a>
  </Button>
)

/** Recovery codes are not errors the voter sees; throw here so routing bugs surface in tests. */
const RECOVERY_REASONS = new Set(['attempt_expired', 'code_used', 'verifier_mismatch', 'session_lost'])

/**
 * Maps a CertAuthError to the display spec for ErrorBlock.
 * Pass `mode: 'check'` to get "Check a different certificate" instead of "Use a different certificate".
 */
export const getErrorSpec = (error: CertAuthError, opts: ErrorSpecOptions): ErrorSpec => {
  const { t, language, mode, closesAt, opensAt, now = new Date(), onRetry } = opts

  const reason = error.reason
  if (RECOVERY_REASONS.has(reason)) throw new Error(`getErrorSpec called with recovery code: ${reason}`)

  const issuerData = error.data?.issuer ? ISSUER_LINKS[error.data.issuer.id] : undefined
  const note = mode === 'check' ? stillTimeNote(t, opensAt, language) : closingNote(t, closesAt, language, now)

  if (reason === 'dni_not_in_census') {
    const holder = error.data?.holder
    return {
      icon: LuUserX,
      title: t('cert_auth.errors.dni_not_in_census.title', {
        defaultValue: "This certificate isn't on the voter list",
      }),
      sentence: holder ? (
        <Trans
          i18nKey='cert_auth.errors.dni_not_in_census.sentence'
          defaults='It belongs to <bold>{{name}}</bold> ({{docType}} ending in {{ending}}).'
          values={{ name: holder.fullName, docType: holder.documentType, ending: holder.documentEnding }}
          components={{ bold: <b /> }}
        />
      ) : (
        t('cert_auth.errors.dni_not_in_census.sentence_unknown', {
          defaultValue: 'The certificate belongs to a different person.',
        })
      ),
      primary: <UseDifferentButton t={t} mode={mode} onRetry={onRetry} primary />,
      note,
    }
  }

  if (reason === 'expired') {
    const issuer = issuerData ?? (error.data?.issuer ? { name: error.data.issuer.name, href: '#' } : undefined)
    const issuerName = issuer?.name ?? 'your certificate issuer'
    const notAfter = error.data?.notAfter ? new Date(error.data.notAfter) : undefined
    const sentence = notAfter
      ? t('cert_auth.errors.expired.sentence_date', {
          defaultValue: 'Your {{issuer}} certificate expired on {{date}}.',
          issuer: issuerName,
          date: formatDate(notAfter, language),
        })
      : t('cert_auth.errors.expired.sentence', {
          defaultValue: 'Your {{issuer}} certificate is no longer valid.',
          issuer: issuerName,
        })
    return {
      icon: LuCalendarX,
      title: t('cert_auth.errors.expired.title', { defaultValue: 'Your certificate has expired' }),
      sentence,
      primary: issuer ? (
        <GetNewCertButton t={t} issuer={issuer} />
      ) : (
        <UseDifferentButton t={t} mode={mode} onRetry={onRetry} primary />
      ),
      secondary: issuer ? <UseDifferentButton t={t} mode={mode} onRetry={onRetry} /> : undefined,
      note,
    }
  }

  if (reason === 'no_certificate') {
    return {
      icon: LuSearchX,
      title: t('cert_auth.errors.no_certificate.title', { defaultValue: 'No certificate found in this browser' }),
      sentence: t('cert_auth.errors.no_certificate.sentence', {
        defaultValue: 'This browser may not have one installed, or the window to choose it was closed.',
      }),
      primary: <TryAgainButton t={t} onRetry={onRetry} />,
      secondary: <CopyLinkButton />,
      note,
    }
  }

  if (reason === 'untrusted_issuer') {
    return {
      icon: LuShieldX,
      title: t('cert_auth.errors.untrusted_issuer.title', { defaultValue: "This certificate can't be used here" }),
      sentence: t('cert_auth.errors.untrusted_issuer.sentence', {
        defaultValue: 'We accept idCAT Certificat and FNMT certificates.',
      }),
      primary: <UseDifferentButton t={t} mode={mode} onRetry={onRetry} primary />,
      note,
    }
  }

  if (reason === 'invalid_chain' || reason === 'provider_mismatch') {
    return {
      icon: LuShieldX,
      title: t(`cert_auth.errors.${reason}.title`, { defaultValue: "We couldn't verify this certificate" }),
      sentence: t(`cert_auth.errors.${reason}.sentence`, {
        defaultValue: 'Try again, or choose another certificate if you have one.',
      }),
      primary: <UseDifferentButton t={t} mode={mode} onRetry={onRetry} primary />,
      note,
    }
  }

  if (reason === 'not_yet_valid') {
    return {
      icon: LuCalendarClock,
      title: t('cert_auth.errors.not_yet_valid.title', { defaultValue: "This certificate isn't active yet" }),
      sentence: t('cert_auth.errors.not_yet_valid.sentence', {
        defaultValue: "If you got it today, try again later. If not, check your device's date and time.",
      }),
      primary: <TryAgainButton t={t} onRetry={onRetry} />,
      note,
    }
  }

  if (reason === 'unsupported_profile') {
    return {
      icon: LuIdCard,
      title: t('cert_auth.errors.unsupported_profile.title', { defaultValue: 'Use your personal certificate' }),
      sentence: t('cert_auth.errors.unsupported_profile.sentence', {
        defaultValue:
          'This one is for a company, a representative or an employee. Choose the certificate issued to you as a person.',
      }),
      primary: <UseDifferentButton t={t} mode={mode} onRetry={onRetry} primary />,
      note,
    }
  }

  if (reason === 'unsupported_purpose') {
    return {
      icon: LuIdCard,
      title: t('cert_auth.errors.unsupported_purpose.title', {
        defaultValue: "This certificate can't be used to sign in",
      }),
      sentence: t('cert_auth.errors.unsupported_purpose.sentence', {
        defaultValue: 'Choose the certificate you use to identify yourself.',
      }),
      primary: <UseDifferentButton t={t} mode={mode} onRetry={onRetry} primary />,
      note,
    }
  }

  if (reason === 'weak_algorithm') {
    const issuerName = issuerData?.name ?? error.data?.issuer?.name
    const sentence = issuerName
      ? t('cert_auth.errors.weak_algorithm.sentence_issuer', {
          defaultValue: 'Get a new one from {{issuer}}.',
          issuer: issuerName,
        })
      : t('cert_auth.errors.weak_algorithm.sentence', { defaultValue: 'Get a new certificate to vote.' })
    return {
      icon: LuShieldX,
      title: t('cert_auth.errors.weak_algorithm.title', { defaultValue: 'This certificate is too old to use here' }),
      sentence,
      primary: issuerData ? (
        <GetNewCertButton t={t} issuer={issuerData} />
      ) : (
        <UseDifferentButton t={t} mode={mode} onRetry={onRetry} primary />
      ),
      secondary: issuerData ? <UseDifferentButton t={t} mode={mode} onRetry={onRetry} /> : undefined,
      note,
    }
  }

  if (reason === 'test_certificate') {
    return {
      icon: LuShieldX,
      title: t('cert_auth.errors.test_certificate.title', { defaultValue: 'This is a test certificate' }),
      sentence: t('cert_auth.errors.test_certificate.sentence', { defaultValue: 'Use your real certificate.' }),
      primary: <UseDifferentButton t={t} mode={mode} onRetry={onRetry} primary />,
      note,
    }
  }

  if (reason === 'identity_invalid') {
    return {
      icon: LuUserX,
      title: t('cert_auth.errors.identity_invalid.title', {
        defaultValue: "We couldn't read the identity in this certificate",
      }),
      sentence: t('cert_auth.errors.identity_invalid.sentence', {
        defaultValue: 'Choose another certificate if you have one.',
      }),
      primary: <UseDifferentButton t={t} mode={mode} onRetry={onRetry} primary />,
      note,
    }
  }

  if (reason === 'identity_unsupported_document') {
    return {
      icon: LuUserX,
      title: t('cert_auth.errors.identity_unsupported_document.title', {
        defaultValue: 'This certificate has no DNI or NIE',
      }),
      sentence: t('cert_auth.errors.identity_unsupported_document.sentence', {
        defaultValue: 'You need a certificate issued with your DNI or NIE.',
      }),
      primary: <UseDifferentButton t={t} mode={mode} onRetry={onRetry} primary />,
      note,
    }
  }

  if (reason === 'revoked') {
    return {
      icon: LuBan,
      title: t('cert_auth.errors.revoked.title', { defaultValue: 'This certificate is no longer valid' }),
      sentence: t('cert_auth.errors.revoked.sentence', {
        defaultValue: 'Its issuer cancelled it. This usually happens after a renewal or when it was reported lost.',
      }),
      primary: <UseDifferentButton t={t} mode={mode} onRetry={onRetry} primary />,
      secondary: issuerData ? <GetNewCertButton t={t} issuer={issuerData} /> : undefined,
      note,
    }
  }

  if (reason === 'revocation_unknown') {
    const issuerName = issuerData?.name ?? error.data?.issuer?.name
    const title = issuerName
      ? t('cert_auth.errors.revocation_unknown.title', {
          defaultValue: "We couldn't confirm this certificate with {{issuer}}",
          issuer: issuerName,
        })
      : t('cert_auth.errors.revocation_unknown.title_no_issuer', {
          defaultValue: "We couldn't confirm this certificate",
        })
    const sentence = issuerName
      ? t('cert_auth.errors.revocation_unknown.sentence', {
          defaultValue: 'Contact {{issuer}} and give them the reference code.',
          issuer: issuerName,
        })
      : t('cert_auth.errors.revocation_unknown.sentence_no_issuer', {
          defaultValue: 'Contact your certificate issuer and give them the reference code.',
        })
    return {
      icon: LuShieldQuestion,
      title,
      sentence,
      primary: <UseDifferentButton t={t} mode={mode} onRetry={onRetry} primary />,
      note,
    }
  }

  if (reason === 'revocation_unavailable') {
    return {
      icon: LuCloudOff,
      title: t('cert_auth.errors.revocation_unavailable.title', {
        defaultValue: "We couldn't check your certificate right now",
      }),
      sentence: t('cert_auth.errors.revocation_unavailable.sentence', {
        defaultValue: 'This is temporary and not caused by you. Try again in a few minutes.',
      }),
      primary: <TryAgainButton t={t} onRetry={onRetry} />,
      note,
    }
  }

  if (reason === 'internal') {
    return {
      icon: LuCircleAlert,
      title: t('cert_auth.errors.internal.title', { defaultValue: 'Something went wrong on our side' }),
      sentence: t('cert_auth.errors.internal.sentence', { defaultValue: 'Try again in a few minutes.' }),
      primary: <TryAgainButton t={t} onRetry={onRetry} />,
      note,
    }
  }

  if (reason === 'network') {
    return {
      icon: LuWifiOff,
      title: t('cert_auth.errors.network.title', { defaultValue: "We couldn't reach the certificate check" }),
      sentence: t('cert_auth.errors.network.sentence', {
        defaultValue:
          'Check your connection and try again. On a work or school network, try mobile data or another network.',
      }),
      primary: <TryAgainButton t={t} onRetry={onRetry} />,
      secondary: <CopyLinkButton />,
      note,
    }
  }

  if (reason === 'too_many_attempts') {
    const retryAfter = error.data?.retryAfter
    const retryAt = retryAfter != null ? new Date(now.getTime() + retryAfter * 1000) : undefined
    const sentence = retryAt
      ? t('cert_auth.errors.too_many_attempts.sentence', {
          defaultValue: 'For your security, try again after {{time}}.',
          time: formatTime(retryAt, language),
        })
      : t('cert_auth.errors.too_many_attempts.sentence_no_time', {
          defaultValue: 'For your security, please wait before trying again.',
        })
    return {
      icon: LuTimer,
      title: t('cert_auth.errors.too_many_attempts.title', { defaultValue: 'Too many attempts' }),
      sentence,
      primary: null,
      note,
    }
  }

  // Fallback for unknown codes
  return {
    icon: LuCircleAlert,
    title: t('cert_auth.errors.internal.title', { defaultValue: 'Something went wrong on our side' }),
    sentence: t('cert_auth.errors.internal.sentence', { defaultValue: 'Try again in a few minutes.' }),
    primary: <TryAgainButton t={t} onRetry={onRetry} />,
    note,
  }
}
