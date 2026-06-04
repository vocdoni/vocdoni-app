import { CensusType, ElectionResultsTypeNames, ElectionStatus, PublishedElection } from '@vocdoni/sdk'
import { createElection, createElectionWithResults, createReport, translate } from './__fixtures__'
import { buildCertificateData } from './certificate-data'

vi.mock('@vocdoni/sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/sdk')>()
  class MockPublishedElection {}
  return { ...actual, PublishedElection: MockPublishedElection }
})

describe('buildCertificateData', () => {
  it('formats voting period timestamps with a single UTC suffix', () => {
    const election = Object.assign(createElection(), {
      meta: {},
    })

    const data = buildCertificateData({
      report: createReport(election),
      t: ((key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key) as never,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.issueDate).toBe('2026-01-03')
    expect(data.issueTime).toBe('10:00:00 UTC')

    const values = data.generalInformation
      .filter((field) => field.label.includes('Voting period'))
      .map((field) => field.value)

    expect(values).toEqual(['2026-01-01 10:00 UTC', '2026-01-02 10:00 UTC'])
  })

  it('includes visibility, infrastructure, and public identifiers in general information', () => {
    const data = buildCertificateData({
      report: createReport(createElection()),
      explorerUrl: 'https://explorer.example',
      t: ((key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key) as never,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.generalInformation.find((field) => field.label === 'Process ID')?.value).toBe('0x1234')
    expect(data.generalInformation.find((field) => field.label === 'Process ID')?.helperText).toBe(
      'Unique public identifier of this voting process. It can be used to find and verify the process in the voting infrastructure.'
    )
    expect(data.generalInformation.find((field) => field.label === 'Census reference')?.value).toBe('Not available')
    expect(data.generalInformation.find((field) => field.label === 'Census reference')?.helperText).toBe(
      'Public reference that identifies the census used for this voting process. It does not include or reveal voters\u2019 personal data.'
    )
    expect(data.censusParticipation.find((field) => field.label === 'Census reference')).toBeUndefined()
    expect(data.generalInformation.find((field) => field.label === 'Infrastructure')?.value).toBe('vocdoni/LTS/1.2')
    expect(data.generalInformation.find((field) => field.label === 'Results visibility')?.value).toBe('Live results')
    expect(data.generalInformation.find((field) => field.label === 'Vote overwrite')?.value).toBe('Disabled')
    expect(
      data.generalInformation.find((field) => field.label === 'Total number of eligible participants')?.value
    ).toBe('100')
    expect(
      data.censusParticipation.find((field) => field.label === 'Total number of eligible participants')
    ).toBeUndefined()
    expect(data.censusParticipation.find((field) => field.label === 'Eligible voters')?.value).toBe('100')
    expect(data.censusParticipation.find((field) => field.label === 'Submitted ballots')?.value).toBe('42')
    expect(data.censusParticipation.find((field) => field.label === 'Voter participation')?.value).toBe('42.00%')
    expect(data.censusParticipation.find((field) => field.label === 'Counting basis')?.value).toBe('1 person, 1 vote')
  })

  it('combines the issuer provider and legal entity in the provider field', () => {
    const data = buildCertificateData({
      report: createReport(createElection()),
      t: ((key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key) as never,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.issuer).toEqual([
      { label: 'Provider', value: 'Vocdoni (Synergize SL)' },
      { label: 'Issuing date', value: '2026-01-03 10:00:00 UTC' },
    ])
  })

  it('describes enabled vote overwrites with the configured limit', () => {
    const t = ((key: string, options?: { defaultValue?: string; votes?: number }) =>
      options?.defaultValue?.replace('{{votes}}', String(options.votes ?? '')) ?? key) as never
    const election = Object.assign(createElection(), {
      voteType: { maxVoteOverwrites: 10 },
    }) as PublishedElection

    const data = buildCertificateData({
      report: createReport(election),
      t,
      organizationName: 'Vocdoni',
      explorerUrl: 'https://explorer.vote',
      now: new Date('2026-05-12T12:00:00Z'),
    })

    expect(data.generalInformation.find((field) => field.label === 'Vote overwrite')?.value).toBe(
      'Enabled, up to 10 vote overwrites per voter'
    )
  })

  it('uses the revised census and voting process copy', () => {
    const t = ((key: string, options?: { defaultValue?: string; count?: number; process_name?: string }) =>
      options?.defaultValue
        ?.replace('{{count}}', String(options.count ?? ''))
        .replace('{{process_name}}', options.process_name ?? '') ?? key) as never

    const data = buildCertificateData({
      report: createReport(createElection()),
      t,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.votingProcessIntro).toBe('The voting process Annual vote consisted of 0 questions.')
  })

  it('preserves result counts and percentages for the executive result table', () => {
    const data = buildCertificateData({
      report: createReport(createElectionWithResults()),
      t: ((key: string, options?: { defaultValue?: string; count?: number; process_name?: string }) =>
        options?.defaultValue
          ?.replace('{{count}}', String(options.count ?? ''))
          .replace('{{process_name}}', options.process_name ?? '') ?? key) as never,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.votingProcessQuestions[0]).toMatchObject({
      question: 'Board continuity proposal',
      totalVotes: '10',
      votingMethod: 'Single choice',
      choices: [
        { name: 'Approve', votes: '7', percentage: '70.0%', numericVotes: 7 },
        { name: 'Reject', votes: '3', percentage: '30.0%', numericVotes: 3 },
      ],
    })
  })

  it('marks results visibility as hidden when the process is secret until the end', () => {
    const hiddenElection = Object.assign(createElection(), {
      electionType: { secretUntilTheEnd: true },
    })

    const data = buildCertificateData({
      report: createReport(hiddenElection),
      t: ((key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key) as never,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.generalInformation.find((field) => field.label === 'Results visibility')?.value).toBe(
      'Hidden until the end'
    )
  })

  it('uses metadata census type for the authentication method before sdk census type', () => {
    const cases = [
      ['csp', CensusType.WEIGHTED, 'Memberbase credentials census'],
      ['spreadsheet', CensusType.CSP, 'Spreadsheet census provided by the organization'],
      ['web3', CensusType.CSP, 'Web3 wallet census provided by the organization'],
      ['unknown', CensusType.CSP, 'Not available'],
    ] as const

    cases.forEach(([metadataCensusType, sdkCensusType, expected]) => {
      const election = Object.assign(createElection(), {
        census: {
          size: 100,
          type: sdkCensusType,
        },
        meta: {
          census: {
            type: metadataCensusType,
          },
        },
      })

      const data = buildCertificateData({
        report: createReport(election),
        t: ((key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key) as never,
        now: new Date('2026-01-03T10:00:00Z'),
      })

      const authMethod = data.authentication.find((field) => field.label === 'Authentication method')

      expect(authMethod?.value).toBe(expected)
    })
  })

  it('prefers wrapped metadata.meta.census over normalized metadata', () => {
    const election = Object.assign(createElection(), {
      census: {
        size: 100,
        type: CensusType.WEIGHTED,
      },
      metadata: {
        meta: {
          census: {
            type: 'csp',
            fields: ['email'],
          },
        },
      },
      meta: {
        census: {
          type: 'web3',
        },
      },
    })

    const data = buildCertificateData({
      report: createReport(election),
      t: translate,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.authentication.find((field) => field.label === 'Authentication method')?.value).toBe(
      'Memberbase credentials census'
    )
    expect(data.authentication.find((field) => field.label === 'Required voter credentials')?.value).toBe('Email')
    expect(data.censusParticipation.find((field) => field.label === 'Census source')?.value).toBe(
      'Memberbase credentials census'
    )
  })

  it('uses normalized meta.census values when wrapped metadata is partial', () => {
    const election = Object.assign(createElection(), {
      census: {
        size: 100,
        type: CensusType.CSP,
      },
      metadata: {
        meta: {
          census: {
            fields: ['email'],
          },
        },
      },
      meta: {
        census: {
          type: 'web3',
        },
      },
    })

    const data = buildCertificateData({
      report: createReport(election),
      t: translate,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.authentication.find((field) => field.label === 'Authentication method')?.value).toBe(
      'Web3 wallet census provided by the organization'
    )
    expect(data.authentication.find((field) => field.label === 'Voter access source')?.value).toBe(
      'Voters access with the wallet address included in the Web3 census.'
    )
  })

  it('shows spreadsheet and web3 access as census-source authentication instead of credential checks', () => {
    const cases = [
      [
        'spreadsheet',
        'Spreadsheet census provided by the organization',
        'Voters access with credentials derived from the spreadsheet census uploaded by the organization.',
      ],
      [
        'web3',
        'Web3 wallet census provided by the organization',
        'Voters access with the wallet address included in the Web3 census.',
      ],
    ] as const

    cases.forEach(([censusType, expectedMethod, expectedSource]) => {
      const election = Object.assign(createElection(), {
        census: {
          size: 100,
          type: CensusType.CSP,
        },
        meta: {
          census: {
            type: censusType,
          },
        },
      })

      const data = buildCertificateData({
        report: createReport(election),
        t: translate,
        now: new Date('2026-01-03T10:00:00Z'),
      })

      expect(data.authentication.find((field) => field.label === 'Authentication method')?.value).toBe(expectedMethod)
      expect(data.authentication.find((field) => field.label === 'Voter access source')?.value).toBe(expectedSource)
      expect(data.authentication.find((field) => field.label === 'Additional identity check')).toBeUndefined()
    })
  })

  it('separates voter participation from weighted voting-power totals', () => {
    const weightedElection = Object.assign(createElection(), {
      voteCount: 2,
      census: {
        size: 3,
        type: CensusType.WEIGHTED,
        weight: 2000,
      },
      meta: {
        census: {
          type: 'web3',
        },
        token: {
          decimals: 2,
        },
      },
      questions: [
        {
          title: { default: 'Weighted board proposal' },
          choices: [
            { title: { default: 'Approve' }, results: 700 },
            { title: { default: 'Reject' }, results: 300 },
          ],
        },
      ],
    }) as PublishedElection

    const data = buildCertificateData({
      report: createReport(weightedElection, { isWeighted: true, participation: 66.67, turnout: 100 }),
      t: translate,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.censusParticipation.find((field) => field.label === 'Eligible voters')?.value).toBe('3')
    expect(data.censusParticipation.find((field) => field.label === 'Submitted ballots')?.value).toBe('2')
    expect(data.censusParticipation.find((field) => field.label === 'Voter participation')?.value).toBe('66.67%')
    expect(data.censusParticipation.find((field) => field.label === 'Counting basis')?.value).toBe('Weighted voting')
    expect(data.censusParticipation.find((field) => field.label === 'Total eligible voting power')?.value).toBe('20')
    expect(data.censusParticipation.find((field) => field.label === 'Voting power used')?.value).toBe('10')
    expect(data.censusParticipation.find((field) => field.label === 'Weighted participation')?.value).toBe('50.00%')
    expect(data.resultValueLabel).toBe('Voting power')
    expect(data.questionTotalLabel).toBe('Voting power used')
    expect(data.votingProcessQuestions[0]).toMatchObject({
      totalVotes: '10',
      countingBasisLabel: 'Weighted voting',
      submittedBallots: '2',
      votingPowerUsed: '10',
      eligibleVotingPower: '20',
      isWeighted: true,
      votingMethod: 'Single choice with weighted voting',
      choices: [
        {
          name: 'Approve',
          votes: '7',
          votingPower: '7',
          percentage: '70.0%',
          castPowerPercentage: '70.0%',
          eligiblePowerPercentage: '35.0%',
          numericVotes: 7,
        },
        {
          name: 'Reject',
          votes: '3',
          votingPower: '3',
          percentage: '30.0%',
          castPowerPercentage: '30.0%',
          eligiblePowerPercentage: '15.0%',
          numericVotes: 3,
        },
      ],
    })
    expect(data.votingProcessQuestions[0].choices[0].ballotCount).toBeUndefined()
  })

  it('keeps fractional voting power when token decimals are applied', () => {
    const weightedElection = Object.assign(createElection(), {
      voteCount: 2,
      census: {
        size: 3,
        type: CensusType.WEIGHTED,
        weight: 1234,
      },
      meta: {
        token: {
          decimals: 2,
        },
      },
      questions: [
        {
          title: { default: 'Weighted budget proposal' },
          choices: [
            { title: { default: 'Approve' }, results: 317 },
            { title: { default: 'Reject' }, results: 300 },
          ],
        },
      ],
    }) as PublishedElection

    const data = buildCertificateData({
      report: createReport(weightedElection, { isWeighted: true, participation: 66.67 }),
      t: translate,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.censusParticipation.find((field) => field.label === 'Total eligible voting power')?.value).toBe('12.34')
    expect(data.censusParticipation.find((field) => field.label === 'Voting power used')?.value).toBe('6.17')
    expect(data.censusParticipation.find((field) => field.label === 'Weighted participation')?.value).toBe('50.00%')
    expect(data.votingProcessQuestions[0]).toMatchObject({
      totalVotes: '6.17',
      votingPowerUsed: '6.17',
      eligibleVotingPower: '12.34',
      choices: [
        {
          name: 'Approve',
          votingPower: '3.17',
          castPowerPercentage: '51.4%',
          eligiblePowerPercentage: '25.7%',
        },
        {
          name: 'Reject',
          votingPower: '3',
          castPowerPercentage: '48.6%',
          eligiblePowerPercentage: '24.3%',
        },
      ],
    })
  })

  it('summarizes multi-question weighted voting power as a range in section 4', () => {
    const weightedElection = Object.assign(createElection(), {
      voteCount: 3,
      census: {
        size: 5,
        type: CensusType.WEIGHTED,
        weight: 2000,
      },
      meta: {
        token: {
          decimals: 2,
        },
      },
      questions: [
        {
          title: { default: 'First weighted proposal' },
          choices: [
            { title: { default: 'Approve' }, results: 700 },
            { title: { default: 'Reject' }, results: 300 },
          ],
        },
        {
          title: { default: 'Second weighted proposal' },
          choices: [
            { title: { default: 'Approve' }, results: 200 },
            { title: { default: 'Reject' }, results: 300 },
          ],
        },
      ],
    }) as PublishedElection

    const data = buildCertificateData({
      report: createReport(weightedElection, { isWeighted: true, participation: 60 }),
      t: translate,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.censusParticipation.find((field) => field.label === 'Voting power used')?.value).toBe('5 - 10')
    expect(data.censusParticipation.find((field) => field.label === 'Weighted participation')?.value).toBe(
      '25.00% - 50.00%'
    )
    expect(data.votingProcessQuestions[1]).toMatchObject({
      totalVotes: '5',
      votingPowerUsed: '5',
      eligibleVotingPower: '20',
      choices: [
        {
          name: 'Approve',
          votingPower: '2',
          castPowerPercentage: '40.0%',
          eligiblePowerPercentage: '10.0%',
        },
        {
          name: 'Reject',
          votingPower: '3',
          castPowerPercentage: '60.0%',
          eligiblePowerPercentage: '15.0%',
        },
      ],
    })
  })

  it('includes abstain results for abstain-enabled multiple choice elections', () => {
    const election = Object.assign(createElection(), {
      voteCount: 10,
      resultsType: {
        name: ElectionResultsTypeNames.MULTIPLE_CHOICE,
        properties: {
          canAbstain: true,
        },
      },
      questions: [
        {
          title: { default: 'Pick priorities' },
          numAbstains: 3,
          choices: [
            { title: { default: 'Climate' }, results: 4 },
            { title: { default: 'Housing' }, results: 3 },
          ],
        },
      ],
    }) as PublishedElection

    const data = buildCertificateData({
      report: createReport(election),
      t: translate,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.votingProcessQuestions[0].choices).toEqual([
      { name: 'Climate', votes: '4', percentage: '40.0%', numericVotes: 4 },
      { name: 'Housing', votes: '3', percentage: '30.0%', numericVotes: 3 },
      { name: 'Abstain', votes: '3', percentage: '30.0%', numericVotes: 3 },
    ])
  })

  it('hides question results while secret-until-end elections are not in final results', () => {
    const election = Object.assign(createElectionWithResults(), {
      status: ElectionStatus.ENDED,
      electionType: { secretUntilTheEnd: true },
    }) as PublishedElection

    const data = buildCertificateData({
      report: createReport(election),
      t: translate,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.resultsHiddenText).toBe('Results are hidden until the process reaches the final results stage.')
    expect(data.votingProcessQuestions).toEqual([])
  })

  it('describes additional code verification in user-centric language', () => {
    const election = Object.assign(createElection(), {
      census: {
        size: 100,
        type: 'csp',
      },
    })

    const data = buildCertificateData({
      report: createReport(election),
      censusBundle: {
        census: {
          authFields: ['email'],
          twoFaFields: ['email'],
        },
      },
      t: ((key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key) as never,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    const additionalCodeVerification = data.authentication.find((field) => field.label === 'Additional identity check')

    expect(additionalCodeVerification?.value).toBe(
      'Enabled: voters confirm their identity with a one-time code sent to their personal devices.'
    )
  })

  it('renders identity source fields with translated member labels', () => {
    const election = Object.assign(createElection(), {
      census: {
        size: 100,
        type: 'csp',
      },
      meta: {
        census: {
          fields: ['name', 'memberNumber', 'nationalId', 'customField'],
        },
      },
    })
    const translations: Record<string, string> = {
      'members.fields.firstname': 'Nom',
      'members.fields.member_number': 'Número de soci',
      'members.fields.national_id': "Document d'Identitat",
    }

    const data = buildCertificateData({
      report: createReport(election),
      t: ((key: string, options?: { defaultValue?: string }) =>
        translations[key] ?? options?.defaultValue ?? key) as never,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    const identitySource = data.authentication.find((field) => field.label === 'Required voter credentials')

    expect(identitySource?.value).toBe("Nom, Número de soci, Document d'Identitat, customField")
  })
})
