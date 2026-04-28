import { Button, HStack, Icon, Menu, Spinner, Text } from '@chakra-ui/react'
import { useToast } from '~components/Toast'
import * as ReactPDF from '@react-pdf/renderer'
import { CensusType, dotobject, InvalidElection, PublishedElection } from '@vocdoni/sdk'
import { type TFunction } from 'i18next'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuFileDown } from 'react-icons/lu'
import { useClient, useOrganization } from '@vocdoni/react-components'

const { pdf, Document, Page, StyleSheet, Text: PdfText, View } = ReactPDF

type VotingReportPdfProps = {
  election?: PublishedElection | InvalidElection | null
}

type CensusBundleData = {
  census: {
    published?: {
      uri?: string
      root?: string
    }
    authFields?: string[]
    twoFaFields?: string[]
    type?: string
  }
}

type CertificateField = {
  label: string
  value: string
}

type CertificateChoice = {
  name: string
  votes: string
  percentage: string
}

type CertificateQuestion = {
  question: string
  choices: CertificateChoice[]
  totalVotes: string
  outcome: string
}

type CertificateData = {
  eventReference: string
  issueDate: string
  organizationName: string
  eventName: string
  blockchainNetwork: string
  notAvailableLabel: string
  introParagraphs: string[]
  generalInformation: CertificateField[]
  authentication: CertificateField[]
  votingSystemParagraphs: string[]
  votingSystemBullets: string[]
  census: CertificateField[]
  turnout: CertificateField[]
  participantsReference: string
  votingProcessIntro: string
  votingProcessQuestions: CertificateQuestion[]
  verification: CertificateField[]
  verificationProcedures: string[]
  scopeBullets: string[]
  issuer: CertificateField[]
  signature: CertificateField[]
  disclaimerParagraphs: string[]
  disclaimerBullets: string[]
}

type PdfDocumentProps = {
  data: CertificateData
  t: TFunction
}

const styles = StyleSheet.create({
  page: {
    padding: 34,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.45,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.2,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    color: '#4b5563',
    textAlign: 'center',
  },
  leadParagraph: {
    marginBottom: 8,
  },
  issuedLine: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 9,
    color: '#374151',
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 3,
    alignItems: 'flex-start',
  },
  fieldRowStacked: {
    flexDirection: 'column',
    gap: 2,
    marginBottom: 6,
  },
  fieldLabel: {
    width: '42%',
    fontWeight: 700,
  },
  fieldValue: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    width: '58%',
    wordBreak: 'break-all',
  },
  fieldValueStacked: {
    width: '100%',
  },
  paragraph: {
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 3,
  },
  bulletMarker: {
    width: 10,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
  },
  questionCard: {
    marginTop: 8,
    padding: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderRadius: 4,
  },
  questionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 4,
  },
  questionMeta: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 6,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 2,
  },
  optionLabel: {
    width: '68%',
  },
  optionValue: {
    width: '32%',
    textAlign: 'right',
  },
  smallText: {
    fontSize: 9,
    color: '#6b7280',
  },
})

const sanitizeFileName = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const notAvailable = (t: TFunction) => t('process_pdf.not_available', { defaultValue: 'Not available' })

const isLongDenseValue = (value: string) => value.length >= 40 && !/\s/.test(value)

const shouldStackFieldValue = (value: string) => /^https?:\/\//i.test(value) || isLongDenseValue(value)
const formatPdfFieldValue = (value: string) => value

const formatUtcDateTime = (date?: Date | null) =>
  date ? `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC` : null

const formatUtcDate = (date?: Date | null) => (date ? date.toISOString().slice(0, 10) : null)

const humanizeCensusType = (t: TFunction, censusType?: string | null) => {
  switch (censusType) {
    case CensusType.CSP:
      return t('process_pdf.census_type.csp', { defaultValue: 'CSP census' })
    case CensusType.WEIGHTED:
      return t('process_pdf.census_type.weighted', { defaultValue: 'Weighted census' })
    case CensusType.ANONYMOUS:
      return t('process_pdf.census_type.anonymous', { defaultValue: 'Anonymous weighted census' })
    default:
      return t('process_pdf.census_type.unknown', { defaultValue: 'Not available' })
  }
}

const formatMaybeString = (value?: string | number | null, fallback?: string) => {
  if (value === null || typeof value === 'undefined' || value === '') return fallback ?? ''
  return String(value)
}

const getQuestionVotes = (election: PublishedElection, questionIndex: number) => {
  const results = election.results?.[questionIndex] ?? []
  const numericVotes = results
    .map((vote) => Number(vote))
    .filter((vote) => Number.isFinite(vote))
    .reduce((acc, vote) => acc + vote, 0)

  return Number.isFinite(numericVotes) && numericVotes > 0 ? numericVotes : (election.voteCount ?? 0)
}

const getQuestionChoices = (election: PublishedElection, questionIndex: number, notAvailableLabel: string) => {
  const question = election.questions[questionIndex]
  const votesForQuestion = getQuestionVotes(election, questionIndex)
  const counts = election.results?.[questionIndex] ?? []

  const choices = question.choices.map((choice, choiceIndex) => {
    const rawVotes = counts[choiceIndex] ?? choice.results ?? choice.answer
    const numericVotes = Number(rawVotes)
    const hasNumericVotes = Number.isFinite(numericVotes)
    const votes = hasNumericVotes ? String(numericVotes) : formatMaybeString(rawVotes, notAvailableLabel)
    const percentage =
      hasNumericVotes && votesForQuestion > 0
        ? `${((numericVotes / votesForQuestion) * 100).toFixed(2)}%`
        : notAvailableLabel

    return {
      name: choice.title.default,
      votes,
      percentage,
      numericVotes: hasNumericVotes ? numericVotes : null,
    }
  })

  return choices
}

const getQuestionOutcome = (choices: Array<{ name: string; numericVotes: number | null }>, fallback: string) => {
  const numericChoices = choices.filter((choice) => choice.numericVotes !== null)
  if (!numericChoices.length) return fallback

  const maxVotes = Math.max(...numericChoices.map((choice) => choice.numericVotes ?? 0))
  if (!Number.isFinite(maxVotes)) return fallback

  const winners = numericChoices
    .filter((choice) => (choice.numericVotes ?? 0) === maxVotes)
    .map((choice) => choice.name)
  return winners.length ? winners.join(', ') : fallback
}

export const buildCertificateData = ({
  election,
  t,
  organizationName,
  explorerUrl,
  censusBundle,
  now,
}: {
  election: PublishedElection
  t: TFunction
  organizationName?: string
  explorerUrl?: string
  censusBundle?: CensusBundleData | null
  now: Date
}): CertificateData => {
  const notAvailableLabel = notAvailable(t)
  const eventReference = election.title.default?.trim() || election.id
  const issueDate = formatUtcDate(now) ?? notAvailableLabel
  const startDatetime = formatUtcDateTime(election.startDate) ?? notAvailableLabel
  const endDatetime = formatUtcDateTime(election.endDate) ?? notAvailableLabel
  const verificationExplorerLink = explorerUrl ? `${explorerUrl}/process/${election.id}` : notAvailableLabel
  const count = election.voteCount ?? 0
  const censusMeta = dotobject(election.meta || {}, 'census') as
    | { type?: string; fields?: string[]; salt?: string }
    | undefined
  const censusType = election.census.type
  const censusFields = censusBundle?.census.authFields ?? censusMeta?.fields ?? []
  const twoFaFields = censusBundle?.census.twoFaFields ?? []
  const censusReference =
    censusBundle?.census.published?.uri ?? election.census.censusURI ?? election.census.censusId ?? notAvailableLabel
  const censusRootHash = censusBundle?.census.published?.root ?? election.census.censusId ?? notAvailableLabel
  const authenticationMethod = humanizeCensusType(t, censusType)
  const identitySource = censusFields.length > 0 ? censusFields.join(', ') : notAvailableLabel
  const twoFaEnabledDisabled =
    censusBundle === null
      ? notAvailableLabel
      : twoFaFields.length > 0
        ? t('process_pdf.boolean.yes', { defaultValue: 'Yes' })
        : t('process_pdf.boolean.no', { defaultValue: 'No' })
  const encryptionType =
    election.electionType?.metadata?.encrypted === true
      ? t('process_pdf.encryption.encrypted', { defaultValue: 'Encrypted' })
      : election.electionType?.metadata?.encrypted === false
        ? t('process_pdf.encryption.not_encrypted', { defaultValue: 'Not encrypted' })
        : notAvailableLabel
  const blockchainNetwork = election.chainId || notAvailableLabel
  const totalEligibleParticipants = String(election.census?.size ?? election.maxCensusSize ?? 0)
  const turnoutPercentage =
    totalEligibleParticipants !== '0' ? ((count / Number(totalEligibleParticipants)) * 100).toFixed(2) : '0.00'

  return {
    eventReference,
    issueDate,
    organizationName: organizationName || election.organizationId || notAvailableLabel,
    eventName: eventReference,
    blockchainNetwork,
    notAvailableLabel,
    introParagraphs: [
      t('process_pdf.intro_paragraph_1', {
        defaultValue:
          'This document constitutes a formal technical certification of a digital voting process conducted using the Vocdoni Protocol. It establishes a structured, verifiable, and auditable record of the process configuration, eligible participant set (electoral census), actual participation, and final results. Its purpose is to enable independent auditors and authorized third parties to assess the integrity, consistency, and correct execution of the process.',
      }),
      t('process_pdf.intro_paragraph_2', {
        defaultValue:
          'All relevant data associated with this voting process has been recorded and anchored in publicly auditable records within the Vocdoni network. These records ensure transparency, immutability, and end-to-end verifiability, while preserving voter anonymity and ballot confidentiality through cryptographic mechanisms.',
      }),
      t('process_pdf.intro_paragraph_3', {
        defaultValue:
          'This certification is issued exclusively by the technical service provider to attest to the correctness of the system execution and the integrity of the recorded data. It does not replace, supersede, or constitute any form of legal certification, nor does it assert compliance with jurisdiction-specific legal or regulatory requirements.',
      }),
    ],
    generalInformation: [
      {
        label: t('process_pdf.general.organization', { defaultValue: 'Organization' }),
        value: organizationName || notAvailableLabel,
      },
      { label: t('process_pdf.general.event_name', { defaultValue: 'Event name' }), value: eventReference },
      {
        label: t('process_pdf.general.voting_period_start', { defaultValue: 'Voting period (start)' }),
        value: startDatetime,
      },
      {
        label: t('process_pdf.general.voting_period_end', { defaultValue: 'Voting period (end)' }),
        value: endDatetime,
      },
      {
        label: t('process_pdf.general.encryption_method', { defaultValue: 'Encryption method' }),
        value: encryptionType,
      },
      {
        label: t('process_pdf.general.verification_explorer_url', { defaultValue: 'Verification explorer URL' }),
        value: verificationExplorerLink,
      },
      {
        label: t('process_pdf.general.vote_overwrite_enabled', { defaultValue: 'Vote overwrite enabled' }),
        value:
          typeof election.voteType?.maxVoteOverwrites === 'number' && election.voteType.maxVoteOverwrites > 0
            ? t('process_pdf.vote_overwrite_enabled', {
                defaultValue: 'Yes, up to {{count}} overwrites',
                count: election.voteType.maxVoteOverwrites,
              })
            : t('process_pdf.boolean.no', { defaultValue: 'No' }),
      },
    ],
    authentication: [
      {
        label: t('process_pdf.authentication.method', { defaultValue: 'Authentication method' }),
        value: authenticationMethod,
      },
      {
        label: t('process_pdf.authentication.identity_source', { defaultValue: 'Identity data source' }),
        value: identitySource,
      },
      {
        label: t('process_pdf.authentication.two_fa', { defaultValue: '2FA authentication' }),
        value: twoFaEnabledDisabled,
      },
    ],
    votingSystemParagraphs: [
      t('process_pdf.voting_system.paragraph', {
        defaultValue:
          'Voting and tallying operations were executed using Vocdoni, a digital voting protocol supported by:',
      }),
      t('process_pdf.voting_system.guarantee_lead', { defaultValue: 'The system guarantees:' }),
    ],
    votingSystemBullets: [
      t('process_pdf.voting_system.bullet_1', {
        defaultValue: 'Distributed ledger (blockchain) infrastructure',
      }),
      t('process_pdf.voting_system.bullet_2', {
        defaultValue: 'Cryptographic verification and integrity mechanisms',
      }),
      t('process_pdf.voting_system.guarantee_1', { defaultValue: 'Integrity of the voting process' }),
      t('process_pdf.voting_system.guarantee_2', { defaultValue: 'Immutability of recorded data' }),
      t('process_pdf.voting_system.guarantee_3', { defaultValue: 'Independent verifiability of results' }),
      t('process_pdf.voting_system.guarantee_4', { defaultValue: 'Confidentiality of individual ballots' }),
    ],
    census: [
      { label: t('process_pdf.census.source', { defaultValue: 'Census source' }), value: censusReference },
      {
        label: t('process_pdf.census.size', { defaultValue: 'Total number of eligible participants (census size)' }),
        value: totalEligibleParticipants,
      },
    ],
    turnout: [
      {
        label: t('process_pdf.turnout.eligible', { defaultValue: 'Total number of eligible participants' }),
        value: totalEligibleParticipants,
      },
      {
        label: t('process_pdf.turnout.votes_cast', { defaultValue: 'Total number of votes cast' }),
        value: String(count),
      },
      { label: t('process_pdf.turnout.rate', { defaultValue: 'Turnout rate' }), value: `${turnoutPercentage}%` },
    ],
    participantsReference:
      censusBundle?.census.published?.root ||
      election.census.censusId ||
      election.census.censusURI ||
      notAvailableLabel,
    votingProcessIntro: t('process_pdf.voting_process.intro', {
      defaultValue: 'This voting process {{election_id}} consisted of {{count}} question(s).',
      election_id: election.id,
      count: election.questions.length,
    }),
    votingProcessQuestions: election.questions.map((question, questionIndex) => {
      const choices = getQuestionChoices(election, questionIndex, notAvailableLabel)
      const outcome = getQuestionOutcome(choices, notAvailableLabel)

      return {
        question: question.title.default || notAvailableLabel,
        choices: choices.map(({ name, votes, percentage }) => ({ name, votes, percentage })),
        totalVotes: String(getQuestionVotes(election, questionIndex)),
        outcome,
      }
    }),
    verification: [
      {
        label: t('process_pdf.verification.explorer', { defaultValue: 'Verification explorer' }),
        value: verificationExplorerLink,
      },
      {
        label: t('process_pdf.verification.process_root_hash', {
          defaultValue: 'Process Root Hash (SHA-256 or equivalent)',
        }),
        value: notAvailableLabel,
      },
      {
        label: t('process_pdf.verification.census_hash', { defaultValue: 'Census Hash or Reference' }),
        value: censusRootHash,
      },
      {
        label: t('process_pdf.verification.ballot_box', { defaultValue: 'Ballot Box Identifier' }),
        value: election.id,
      },
    ],
    verificationProcedures: [
      t('process_pdf.verification.step_1', { defaultValue: 'Retrieve the process data via the explorer.' }),
      t('process_pdf.verification.step_2', {
        defaultValue: 'Validate the process root hash against the published value.',
      }),
      t('process_pdf.verification.step_3', {
        defaultValue: 'Confirm consistency of census reference and ballot records.',
      }),
      t('process_pdf.verification.step_4', {
        defaultValue: 'Recompute and verify tally results where applicable.',
      }),
    ],
    scopeBullets: [
      t('process_pdf.scope.configuration', { defaultValue: 'Configuration of the voting process' }),
      t('process_pdf.scope.census', { defaultValue: 'Definition of the electoral census' }),
      t('process_pdf.scope.period', { defaultValue: 'Voting period enforcement' }),
      t('process_pdf.scope.participation', { defaultValue: 'Recording of participation data' }),
      t('process_pdf.scope.tally', { defaultValue: 'Automated tallying mechanisms' }),
      t('process_pdf.scope.results', { defaultValue: 'Final computed results' }),
    ],
    issuer: [
      { label: t('process_pdf.issuer.provider', { defaultValue: 'Provider' }), value: 'Vocdoni' },
      { label: t('process_pdf.issuer.legal_entity', { defaultValue: 'Legal entity' }), value: 'Synergize SL' },
    ],
    signature: [
      {
        label: t('process_pdf.signature.name', { defaultValue: 'Name' }),
        value: t('process_pdf.signature.signatory_name', { defaultValue: 'Vocdoni Technical Team' }),
      },
      {
        label: t('process_pdf.signature.position', { defaultValue: 'Position' }),
        value: t('process_pdf.signature.signatory_position', {
          defaultValue: 'Technical service provider',
        }),
      },
      {
        label: t('process_pdf.signature.date', { defaultValue: 'Date' }),
        value: formatUtcDate(now) ?? notAvailableLabel,
      },
    ],
    disclaimerParagraphs: [
      t('process_pdf.disclaimer.paragraph_1', {
        defaultValue:
          'This document constitutes a technical certification derived from system-generated records of the Vocdoni Protocol.',
      }),
    ],
    disclaimerBullets: [
      t('process_pdf.disclaimer.bullet_1', {
        defaultValue: 'It does not constitute legal certification of the voting process.',
      }),
      t('process_pdf.disclaimer.bullet_2', {
        defaultValue: 'It does not replace official records, minutes, or regulatory filings.',
      }),
      t('process_pdf.disclaimer.bullet_3', {
        defaultValue: 'All data originates from cryptographic and blockchain-based logs.',
      }),
      t('process_pdf.disclaimer.bullet_4', {
        defaultValue: 'Ballot secrecy and voter anonymity are preserved by design.',
      }),
      t('process_pdf.disclaimer.paragraph_2', {
        defaultValue:
          'The technical service provider assumes no responsibility for the accuracy of input data (e.g., census composition), legal interpretation of results, or compliance with applicable legal or regulatory frameworks.',
      }),
      t('process_pdf.disclaimer.paragraph_3', {
        defaultValue:
          'Responsibility for legal interpretation and use of this certification rests solely with the requesting organization.',
      }),
    ],
  }
}

const fetchCensusBundle = async (censusURI?: string | null) => {
  if (!censusURI) return null

  try {
    const response = await fetch(censusURI)
    if (!response.ok) return null
    return (await response.json()) as CensusBundleData
  } catch {
    return null
  }
}

const SectionTitle = ({ children }: { children: string }) => <PdfText style={styles.sectionTitle}>{children}</PdfText>

const KeyValueList = ({ items }: { items: CertificateField[] }) => (
  <View>
    {items.map((item) => (
      <View key={item.label} style={shouldStackFieldValue(item.value) ? styles.fieldRowStacked : styles.fieldRow}>
        <PdfText style={styles.fieldLabel}>{item.label}:</PdfText>
        <PdfText style={shouldStackFieldValue(item.value) ? styles.fieldValueStacked : styles.fieldValue}>
          {formatPdfFieldValue(item.value)}
        </PdfText>
      </View>
    ))}
  </View>
)

const BulletList = ({ items }: { items: string[] }) => (
  <View>
    {items.map((item, index) => (
      <View key={`${item}-${index}`} style={styles.bulletRow}>
        <PdfText style={styles.bulletMarker}>-</PdfText>
        <PdfText style={styles.bulletText}>{item}</PdfText>
      </View>
    ))}
  </View>
)

const Paragraphs = ({ items }: { items: string[] }) => (
  <View>
    {items.map((item, index) => (
      <PdfText key={`${item}-${index}`} style={styles.paragraph}>
        {item}
      </PdfText>
    ))}
  </View>
)

const VotingCertificateDocument = ({ data, t }: PdfDocumentProps) => {
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.header}>
          <PdfText style={styles.title} hyphenationCallback={(word) => [word]}>
            {t('process_pdf.document.title', {
              defaultValue: 'TECHNICAL CERTIFICATION OF THE DIGITAL VOTING PROCESS {{event_reference}}',
              event_reference: data.eventReference,
            })}
          </PdfText>
          <PdfText style={styles.subtitle}>
            {t('process_pdf.document.subtitle', {
              defaultValue: '{{event_name}} | Issued on {{issue_date}}',
              event_name: data.eventName,
              issue_date: data.issueDate,
            })}
          </PdfText>
        </View>

        <Paragraphs items={data.introParagraphs} />
        <PdfText style={styles.issuedLine}>
          {t('process_pdf.document.issued_by', {
            defaultValue:
              'Issued by Vocdoni (Synergize SL) on {{issue_date}}, in its capacity as technical service provider.',
            issue_date: data.issueDate,
          })}
        </PdfText>

        <View style={styles.section}>
          <SectionTitle>
            {t('process_pdf.document.sections.general_information', { defaultValue: '1. General Information' })}
          </SectionTitle>
          <KeyValueList items={data.generalInformation} />
        </View>

        <View style={styles.section}>
          <SectionTitle>
            {t('process_pdf.document.sections.authentication', { defaultValue: '2. Authentication' })}
          </SectionTitle>
          <KeyValueList items={data.authentication} />
        </View>

        <View style={styles.section}>
          <SectionTitle>
            {t('process_pdf.document.sections.voting_system', { defaultValue: '3. Voting System' })}
          </SectionTitle>
          <Paragraphs items={data.votingSystemParagraphs} />
          <BulletList items={data.votingSystemBullets} />
          <PdfText style={styles.paragraph}>
            {t('process_pdf.voting_system.executed_on', {
              defaultValue: 'The process was executed on the {{blockchain_network}} infrastructure.',
              blockchain_network: data.blockchainNetwork,
            })}
          </PdfText>
        </View>

        <View style={styles.section}>
          <SectionTitle>
            {t('process_pdf.document.sections.electoral_census', { defaultValue: '4. Electoral Census' })}
          </SectionTitle>
          <KeyValueList items={data.census} />
          <PdfText style={styles.paragraph}>
            {t('process_pdf.census.definition', {
              defaultValue:
                'The electoral census defines the complete set of members authorized to participate in the voting process. Inclusion in the census does not imply actual participation.',
            })}
          </PdfText>
        </View>

        <View style={styles.section}>
          <SectionTitle>
            {t('process_pdf.document.sections.turnout_participation', { defaultValue: '5. Turnout and Participation' })}
          </SectionTitle>
          <KeyValueList items={data.turnout} />
          <PdfText style={styles.paragraph}>
            {t('process_pdf.turnout.participation', {
              defaultValue:
                'The number of votes cast reflects only those participants who effectively submitted a valid ballot during the defined voting period.',
            })}
          </PdfText>
          <PdfText style={styles.paragraph}>
            {t('process_pdf.turnout.participants_reference_title', {
              defaultValue: 'Participants who cast a vote (if applicable)',
            })}
          </PdfText>
          <PdfText style={styles.paragraph}>{data.participantsReference}</PdfText>
          <PdfText style={styles.smallText}>
            {t('process_pdf.turnout.participants_reference_note', {
              defaultValue:
                'Each participant is represented once, irrespective of the number of questions answered. Where applicable, participants are identified using pseudonymous or cryptographic identifiers (e.g., hashed references) to preserve privacy.',
            })}
          </PdfText>
          <PdfText style={styles.smallText}>
            {t('process_pdf.turnout.privacy_note', {
              defaultValue:
                'Under no circumstances can a linkage be established between participant identity and individual vote selections.',
            })}
          </PdfText>
        </View>

        <View style={styles.section}>
          <SectionTitle>
            {t('process_pdf.document.sections.voting_process', { defaultValue: '6. Voting Process' })}
          </SectionTitle>
          <PdfText style={styles.paragraph}>{data.votingProcessIntro}</PdfText>
          {data.votingProcessQuestions.length > 0 ? (
            data.votingProcessQuestions.map((question, index) => (
              <View key={`${question.question}-${index}`} style={styles.questionCard}>
                <PdfText style={styles.questionTitle}>
                  {t('process_pdf.voting_process.card.item', {
                    defaultValue: 'Voting Item {{index}}',
                    index: index + 1,
                  })}
                </PdfText>
                <PdfText style={styles.questionMeta}>
                  {t('process_pdf.voting_process.card.question', {
                    defaultValue: 'Question: {{question}}',
                    question: question.question,
                  })}
                </PdfText>
                <PdfText style={styles.questionMeta}>
                  {t('process_pdf.voting_process.card.participation', {
                    defaultValue: 'Participation: {{votes}} recorded votes',
                    votes: question.totalVotes,
                  })}
                </PdfText>
                <PdfText style={styles.questionMeta}>
                  {t('process_pdf.voting_process.card.available_options', { defaultValue: 'Available options:' })}
                </PdfText>
                {question.choices.length > 0 ? (
                  question.choices.map((choice) => (
                    <View key={`${choice.name}-${choice.votes}`} style={{ marginBottom: 2 }}>
                      <PdfText>{choice.name}</PdfText>
                    </View>
                  ))
                ) : (
                  <PdfText style={styles.smallText}>{data.notAvailableLabel}</PdfText>
                )}
                <PdfText style={styles.questionMeta}>
                  {t('process_pdf.voting_process.card.results', { defaultValue: 'Results:' })}
                </PdfText>
                {question.choices.length > 0 ? (
                  question.choices.map((choice) => (
                    <View key={`${choice.name}-${choice.votes}-result`} style={styles.optionRow}>
                      <PdfText style={styles.optionLabel}>{choice.name}</PdfText>
                      <PdfText style={styles.optionValue}>{`${choice.votes} (${choice.percentage})`}</PdfText>
                    </View>
                  ))
                ) : (
                  <PdfText style={styles.smallText}>{data.notAvailableLabel}</PdfText>
                )}
                <PdfText style={styles.questionMeta}>
                  {t('process_pdf.voting_process.card.outcome', {
                    defaultValue: 'Outcome: {{outcome}}',
                    outcome: question.outcome,
                  })}
                </PdfText>
              </View>
            ))
          ) : (
            <PdfText style={styles.smallText}>{data.notAvailableLabel}</PdfText>
          )}
        </View>

        <View style={styles.section}>
          <SectionTitle>
            {t('process_pdf.document.sections.verification', { defaultValue: '7. Verification' })}
          </SectionTitle>
          <PdfText style={styles.paragraph}>
            {t('process_pdf.verification.paragraph', {
              defaultValue:
                'All process data has been recorded on a blockchain-based infrastructure and may be independently verified through the following public explorer:',
            })}
          </PdfText>
          <KeyValueList items={data.verification} />
          <PdfText style={styles.paragraph}>
            {t('process_pdf.verification.artifacts', {
              defaultValue: 'To facilitate auditability, the following cryptographic artifacts are provided:',
            })}
          </PdfText>
          <BulletList
            items={[
              t('process_pdf.verification.artifact_1', { defaultValue: 'Process Root Hash (SHA-256 or equivalent)' }),
              t('process_pdf.verification.artifact_2', { defaultValue: 'Census Hash or Reference' }),
              t('process_pdf.verification.artifact_3', { defaultValue: 'Ballot Box Identifier' }),
              t('process_pdf.verification.artifact_4', {
                defaultValue: 'These elements collectively enable independent verification of:',
              }),
              t('process_pdf.verification.artifact_5', { defaultValue: 'Data integrity (no alteration of records)' }),
              t('process_pdf.verification.artifact_6', { defaultValue: 'Authenticity of the process' }),
              t('process_pdf.verification.artifact_7', { defaultValue: 'Completeness of the recorded dataset' }),
            ]}
          />
          <PdfText style={styles.paragraph}>
            {t('process_pdf.verification.procedure_title', { defaultValue: 'Verification Procedure (informative)' })}
          </PdfText>
          <BulletList items={data.verificationProcedures} />
        </View>

        <View style={styles.section}>
          <SectionTitle>
            {t('process_pdf.document.sections.certification_scope', { defaultValue: '8. Certification Scope' })}
          </SectionTitle>
          <PdfText style={styles.paragraph}>
            {t('process_pdf.scope.paragraph', {
              defaultValue: 'This certification covers exclusively the following technical aspects:',
            })}
          </PdfText>
          <BulletList items={data.scopeBullets} />
          <PdfText style={styles.paragraph}>
            {t('process_pdf.scope.exclusion', {
              defaultValue:
                'This certification does not cover governance rules, eligibility criteria correctness, or legal compliance.',
            })}
          </PdfText>
        </View>

        <View style={styles.section}>
          <SectionTitle>{t('process_pdf.document.sections.issuer', { defaultValue: '9. Issuer' })}</SectionTitle>
          <KeyValueList items={data.issuer} />
          <PdfText style={styles.paragraph}>
            {t('process_pdf.issuer.paragraph', {
              defaultValue: 'Issued on behalf of the organizing entity in its role as technical service provider.',
            })}
          </PdfText>
        </View>

        <View style={styles.section}>
          <SectionTitle>{t('process_pdf.document.sections.signature', { defaultValue: '10. Signature' })}</SectionTitle>
          <KeyValueList items={data.signature} />
        </View>

        <View style={styles.section}>
          <SectionTitle>{t('process_pdf.disclaimer.title', { defaultValue: 'Disclaimer' })}</SectionTitle>
          <Paragraphs items={data.disclaimerParagraphs} />
          <BulletList items={data.disclaimerBullets.slice(0, 4)} />
          <PdfText style={styles.paragraph}>{data.disclaimerBullets[4]}</PdfText>
          <PdfText style={styles.paragraph}>{data.disclaimerBullets[5]}</PdfText>
        </View>
      </Page>
    </Document>
  )
}

const useVotingReportPdfDownload = (election?: PublishedElection | InvalidElection | null) => {
  const { t } = useTranslation()
  const toast = useToast()
  const { client } = useClient()
  const { organization } = useOrganization()
  const [isGenerating, setIsGenerating] = useState(false)

  const download = async () => {
    if (!(election instanceof PublishedElection) || isGenerating) return

    setIsGenerating(true)
    try {
      const censusMeta = dotobject(election.meta || {}, 'census') as { type?: string } | undefined
      const censusBundle =
        censusMeta?.type === CensusType.CSP ? await fetchCensusBundle(election.census.censusURI) : null
      const data = buildCertificateData({
        election,
        t,
        organizationName: organization?.account?.name?.default,
        explorerUrl: client?.explorerUrl,
        censusBundle,
        now: new Date(),
      })
      const blob = await pdf(<VotingCertificateDocument data={data} t={t} />).toBlob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${sanitizeFileName(election.title.default || 'voting-certificate')}-${sanitizeFileName(election.id)}.pdf`
      anchor.rel = 'noopener noreferrer'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      toast({
        title: t('process_pdf.download_error', { defaultValue: 'Could not generate the PDF report' }),
        type: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return { download, isGenerating }
}

export const VotingReportPdfButton = ({ election }: VotingReportPdfProps) => {
  const { t } = useTranslation()
  const { download, isGenerating } = useVotingReportPdfDownload(election)

  if (!(election instanceof PublishedElection)) return null

  return (
    <Button
      variant='outline'
      w='full'
      size='sm'
      justifyContent='start'
      onClick={download}
      loading={isGenerating}
      loadingText={t('process_pdf.downloading', { defaultValue: 'Generating PDF' })}
    >
      <HStack gap={2}>
        <Icon as={LuFileDown} />
        <Text as='span'>{t('process_pdf.download', { defaultValue: 'Download PDF' })}</Text>
      </HStack>
    </Button>
  )
}

export const VotingReportPdfMenuItem = ({ election }: VotingReportPdfProps) => {
  const { t } = useTranslation()
  const { download, isGenerating } = useVotingReportPdfDownload(election)

  if (!(election instanceof PublishedElection)) return null

  return (
    <Menu.Item value='download-pdf' onClick={download} disabled={isGenerating}>
      {isGenerating ? <Spinner size='xs' /> : <Icon as={LuFileDown} boxSize={4} />}
      {t('process_pdf.download', { defaultValue: 'Download PDF' })}
    </Menu.Item>
  )
}
