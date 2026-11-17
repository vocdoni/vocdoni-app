import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Icon,
  IconButton,
  Input,
  Text,
  useBreakpointValue,
  useClipboard,
} from '@chakra-ui/react'
import type { TFunction } from 'i18next'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckIcon, CopyIcon } from '~theme/icons'
import { SummaryCardHeader } from './SummaryCardHeader'

/** What the voter is asked for, as a phrase for "Asks for …". Static keys, so `pnpm translations` extracts each. */
const fieldPhrase = (t: TFunction, field: string): string | null => {
  switch (field) {
    case 'memberNumber':
      return t('votes.summary.share_field.member_number', { defaultValue: 'the member number' })
    case 'name':
      return t('votes.summary.share_field.name', { defaultValue: 'the first name' })
    case 'surname':
      return t('votes.summary.share_field.surname', { defaultValue: 'the last name' })
    case 'nationalId':
      return t('votes.summary.share_field.national_id', { defaultValue: 'the national ID' })
    case 'birthDate':
      return t('votes.summary.share_field.birth_date', { defaultValue: 'the birth date' })
    case 'password':
      return t('votes.summary.share_field.password', { defaultValue: 'the password' })
    case 'email':
      return t('votes.summary.share_field.email', { defaultValue: 'the email' })
    case 'phone':
      return t('votes.summary.share_field.phone', { defaultValue: 'the phone number' })
    default:
      return null
  }
}

type SummaryShareProps = {
  /** The public voting page. */
  link: string
  authFields: readonly string[]
  /** The one-time code goes to one of these; the voter types one contact, never both. */
  twoFaFields: readonly string[]
  desktop: boolean
}

/** "Per compartir": the public voting link to copy, and what it asks voters for. */
export const SummaryShare = ({ link, authFields, twoFaFields, desktop }: SummaryShareProps) => {
  const { t, i18n } = useTranslation()
  const titleId = useId()
  const { copy, copied } = useClipboard({ value: link })
  const tablet = useBreakpointValue({ base: false, md: true, lg: false })

  const contact =
    twoFaFields.includes('email') && twoFaFields.includes('phone')
      ? t('votes.summary.share_field.email_or_phone', { defaultValue: 'the email or the phone number' })
      : (twoFaFields[0] && fieldPhrase(t, twoFaFields[0])) || null
  const asked = [...authFields.map((field) => fieldPhrase(t, field)), contact].filter((phrase): phrase is string =>
    Boolean(phrase)
  )
  const publicLink = t('votes.summary.share_public', { defaultValue: 'Public link.' })
  const note = asked.length
    ? `${publicLink} ${t('votes.summary.share_asks', {
        defaultValue: 'Asks for {{fields}}.',
        fields: new Intl.ListFormat(i18n.language, { type: 'conjunction' }).format(asked),
      })}`
    : publicLink

  const copyLabel = t('votes.summary.copy_link', { defaultValue: 'Copy the public link' })
  const copyIcon = <Icon as={copied ? CheckIcon : CopyIcon} />
  const row = (
    <Flex gap='2'>
      <Input
        readOnly
        variant='code'
        aria-label={t('voting_link.title', 'Voting Link')}
        // The address without its scheme, as the board prints it; the copy keeps it whole.
        value={link.replace(/^https?:\/\//, '')}
        flex='1'
        minW='0'
      />
      {tablet ? (
        <Button variant='outline' onClick={copy} aria-label={copyLabel}>
          {copyIcon}
          {t('copy.copy', 'Copy')}
        </Button>
      ) : (
        <IconButton variant='outline' onClick={copy} aria-label={copyLabel} title={copyLabel}>
          {copyIcon}
        </IconButton>
      )}
    </Flex>
  )

  if (desktop) {
    return (
      <Card.Root variant='frame' as='section' aria-labelledby={titleId}>
        <Card.Body pt='3' pb='4.5' gap='3'>
          <Box>
            <Heading as='h2' id={titleId} textStyle='section-title'>
              {t('votes.summary.share_title', { defaultValue: 'To share' })}
            </Heading>
            <Text mt='0.5' textStyle='body-sm' color='fg.subtle'>
              {note}
            </Text>
          </Box>
          {row}
        </Card.Body>
      </Card.Root>
    )
  }

  return (
    <Card.Root variant='frame' as='section' aria-labelledby={titleId}>
      <SummaryCardHeader
        id={titleId}
        title={t('votes.summary.share_title', { defaultValue: 'To share' })}
        action={
          <Text textStyle='body' color='fg.subtle'>
            {t('votes.summary.share_public_short', { defaultValue: 'Public link' })}
          </Text>
        }
        desktop={false}
      />
      <Card.Body pt='0' pb={{ base: '4', md: '5' }} maxW={{ md: 'lg' }} borderTopWidth='[0]'>
        {row}
      </Card.Body>
    </Card.Root>
  )
}
