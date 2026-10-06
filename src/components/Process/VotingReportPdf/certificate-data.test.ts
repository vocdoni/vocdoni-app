import {
  PROCESS_ID,
  createElection,
  createQuestion,
  createQuestionResults,
  createResults,
  translate,
} from './__fixtures__'
import {
  buildCertificateData,
  canDownloadVotingReport,
  isVotingReportPending,
  resolveReportElection,
} from './certificate-data'

const plainT = ((key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key) as never

describe('canDownloadVotingReport', () => {
  it('allows a published process whose questions all published their results', () => {
    expect(canDownloadVotingReport(createElection())).toBe(true)
    expect(
      canDownloadVotingReport(
        createElection({
          questions: [createQuestion({ id: 'q1' }), createQuestion({ id: 'q2' })],
        })
      )
    ).toBe(true)
  })

  it('rejects a process that stopped voting but has no tally to certify', () => {
    // An ended process may still be computing its results, and a canceled one never has any.
    expect(canDownloadVotingReport(createElection({ questions: [createQuestion({ status: 'ENDED' })] }))).toBe(false)
    expect(canDownloadVotingReport(createElection({ questions: [createQuestion({ status: 'CANCELED' })] }))).toBe(false)
  })

  it('rejects a process whose results are only partially computed', () => {
    // `computeProcessStatus` collapses a mix of ENDED and RESULTS to ENDED, so this is exactly
    // the case where a report would certify some questions with no tally at all.
    expect(
      canDownloadVotingReport(
        createElection({
          questions: [createQuestion({ id: 'q1', status: 'RESULTS' }), createQuestion({ id: 'q2', status: 'ENDED' })],
        })
      )
    ).toBe(false)
  })

  it('rejects ongoing, paused, draft, and non-process values', () => {
    expect(canDownloadVotingReport(createElection({ questions: [createQuestion({ status: 'ONGOING' })] }))).toBe(false)
    expect(canDownloadVotingReport(createElection({ questions: [createQuestion({ status: 'PAUSED' })] }))).toBe(false)
    expect(canDownloadVotingReport({ ...createElection(), published: false })).toBe(false)
    expect(canDownloadVotingReport({ some: 'record' })).toBe(false)
    expect(canDownloadVotingReport(null)).toBe(false)
  })
})

describe('isVotingReportPending', () => {
  it('is true only while an ended process is still computing its tallies', () => {
    expect(isVotingReportPending(createElection({ questions: [createQuestion({ status: 'ENDED' })] }))).toBe(true)
    // Mixed ENDED/RESULTS collapses to ENDED — some questions have no tally yet.
    expect(
      isVotingReportPending(
        createElection({
          questions: [createQuestion({ id: 'q1', status: 'RESULTS' }), createQuestion({ id: 'q2', status: 'ENDED' })],
        })
      )
    ).toBe(true)
  })

  it('is false once results are in, and for processes that will never have any', () => {
    expect(isVotingReportPending(createElection())).toBe(false)
    // A canceled process never produces a tally, so promising a report would be a lie.
    expect(isVotingReportPending(createElection({ questions: [createQuestion({ status: 'CANCELED' })] }))).toBe(false)
    expect(isVotingReportPending(createElection({ questions: [createQuestion({ status: 'ONGOING' })] }))).toBe(false)
    expect(isVotingReportPending({ ...createElection(), published: false })).toBe(false)
    expect(isVotingReportPending(null)).toBe(false)
  })
})

describe('buildCertificateData', () => {
  it('formats voting period timestamps with a single UTC suffix', () => {
    const data = buildCertificateData({
      election: createElection(),
      results: createResults(),
      t: plainT,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.issueDate).toBe('2026-01-03')
    expect(data.issueTime).toBe('10:00:00 UTC')

    const values = data.generalInformation
      .filter((field) => field.label.includes('Voting period'))
      .map((field) => field.value)

    expect(values).toEqual(['2026-01-01 10:00 UTC', '2026-01-02 10:00 UTC'])
  })

  it('reports the actual end alongside the configured one when stopped early', () => {
    // Stopped ahead of its 2026-01-02 schedule; the configured period still has to be certified.
    const data = buildCertificateData({
      election: createElection(),
      results: createResults(),
      t: plainT,
      now: new Date('2026-01-03T10:00:00Z'),
      earlyEndDate: new Date('2026-01-01T15:42:00Z'),
    })

    const period = data.generalInformation
      .filter((field) => field.label.includes('Voting period'))
      .map((field) => field.value)
    const actualEnd = data.generalInformation.find((field) => field.label === 'Actual end')

    expect(period).toEqual(['2026-01-01 10:00 UTC', '2026-01-02 10:00 UTC'])
    expect(actualEnd?.value).toBe('2026-01-01 15:42 UTC')
    expect(actualEnd?.helperText).toContain('stopped before its configured end')
  })

  it('omits the actual end row for a process that ran to its configured end', () => {
    const data = buildCertificateData({
      election: createElection(),
      results: createResults(),
      t: plainT,
      now: new Date('2026-01-03T10:00:00Z'),
      earlyEndDate: null,
    })

    const values = data.generalInformation
      .filter((field) => field.label.includes('Voting period'))
      .map((field) => field.value)

    expect(values).toEqual(['2026-01-01 10:00 UTC', '2026-01-02 10:00 UTC'])
    expect(data.generalInformation.some((field) => field.label === 'Actual end')).toBe(false)
  })

  it('includes visibility, infrastructure, and public identifiers in general information', () => {
    const data = buildCertificateData({
      election: createElection(),
      results: createResults(),
      explorerUrl: 'https://explorer.example',
      t: plainT,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.generalInformation.find((field) => field.label === 'Process ID')?.value).toBe(PROCESS_ID)
    expect(data.generalInformation.find((field) => field.label === 'Process ID')?.helperText).toBe(
      'Unique public identifier of this voting process. It can be used to find and verify the process in the voting infrastructure.'
    )
    // The new model has no census root/URI, so the report carries no census reference
    expect(data.generalInformation.find((field) => field.label === 'Census reference')).toBeUndefined()
    expect(data.generalInformation.find((field) => field.label === 'Infrastructure')?.value).toBe('vocdoni/LTS/1.2')
    expect(data.generalInformation.find((field) => field.label === 'Results visibility')?.value).toBe('Live results')
    expect(data.generalInformation.find((field) => field.label === 'Vote overwrite')?.value).toBe('Disabled')
    expect(
      data.generalInformation.find((field) => field.label === 'Total number of eligible participants')?.value
    ).toBe('100')
    expect(data.censusParticipation.find((field) => field.label === 'Eligible voters')?.value).toBe('100')
    expect(data.censusParticipation.find((field) => field.label === 'Submitted ballots')?.value).toBe('10')
    expect(data.censusParticipation.find((field) => field.label === 'Voter participation')?.value).toBe('10.00%')
    expect(data.censusParticipation.find((field) => field.label === 'Counting basis')?.value).toBe('1 person, 1 vote')
  })

  it('links each question to its own on-chain process in the verification section', () => {
    const election = createElection({
      questions: [
        createQuestion(),
        createQuestion({ id: 'question-2', upstreamId: 'a39c69dabbf5335bd7d53130ad823a71b7ba9834' }),
      ],
    })

    const data = buildCertificateData({
      election,
      results: null,
      explorerUrl: 'https://explorer.example',
      t: translate,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.verification).toEqual([
      {
        label: 'View in verification explorer — Question 1',
        value: 'https://explorer.example/process/f39c69dabbf5335bd7d53130ad823a71b7ba9834',
        kind: 'link',
      },
      {
        label: 'View in verification explorer — Question 2',
        value: 'https://explorer.example/process/a39c69dabbf5335bd7d53130ad823a71b7ba9834',
        kind: 'link',
      },
    ])
  })

  it('falls back to a not-available verification entry without explorer or on-chain ids', () => {
    const election = createElection({ questions: [createQuestion({ upstreamId: undefined })] })

    const data = buildCertificateData({
      election,
      results: null,
      explorerUrl: 'https://explorer.example',
      t: plainT,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.verification).toEqual([
      { label: 'View in verification explorer', value: 'Not available', kind: 'link' },
    ])
  })

  it('combines the issuer provider and legal entity in the provider field', () => {
    const data = buildCertificateData({
      election: createElection(),
      results: createResults(),
      t: plainT,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.issuer).toEqual([
      { label: 'Provider', value: 'Vocdoni (Synergize SL)' },
      { label: 'Issuing date', value: '2026-01-03 10:00:00 UTC' },
    ])
  })

  it('describes enabled vote overwrites with the configured per-question limit', () => {
    const election = createElection({
      questions: [
        createQuestion({
          ballotProtocol: {
            costExponent: 1,
            costFromWeight: false,
            maxCount: 1,
            maxTotalCost: 0,
            maxValue: 1,
            maxVoteOverwrites: 10,
            uniqueValues: false,
          },
        }),
      ],
    })

    const data = buildCertificateData({
      election,
      results: null,
      t: translate,
      organizationName: 'Vocdoni',
      explorerUrl: 'https://explorer.vote',
      now: new Date('2026-05-12T12:00:00Z'),
    })

    expect(data.generalInformation.find((field) => field.label === 'Vote overwrite')?.value).toBe(
      'Enabled, up to 10 vote overwrites per voter'
    )
  })

  it('uses the revised census and voting process copy', () => {
    const data = buildCertificateData({
      election: createElection(),
      results: createResults(),
      t: translate,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.votingProcessIntro).toBe('The voting process Annual vote consisted of 1 questions.')
  })

  it('preserves result counts and percentages for the executive result table', () => {
    const data = buildCertificateData({
      election: createElection(),
      results: createResults(),
      t: translate,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.votingProcessQuestions[0]).toMatchObject({
      question: 'Board continuity proposal',
      totalVotes: '10',
      votingMethod: 'Single choice',
      submittedBallots: '10',
      choices: [
        { name: 'Approve', votes: '7', percentage: '70.0%', numericVotes: 7 },
        { name: 'Reject', votes: '3', percentage: '30.0%', numericVotes: 3 },
      ],
    })
  })

  it('degrades to not-available values when the results are missing', () => {
    const data = buildCertificateData({
      election: createElection(),
      results: null,
      t: plainT,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.censusParticipation.find((field) => field.label === 'Submitted ballots')?.value).toBe('Not available')
    expect(data.censusParticipation.find((field) => field.label === 'Voter participation')?.value).toBe('Not available')
    expect(data.votingProcessQuestions[0]).toMatchObject({
      totalVotes: 'Not available',
      submittedBallots: 'Not available',
      choices: [
        { name: 'Approve', votes: 'Not available', percentage: 'Not available', numericVotes: null },
        { name: 'Reject', votes: 'Not available', percentage: 'Not available', numericVotes: null },
      ],
    })
  })

  it('reports not-available tallies for a question whose ballot type cannot be inferred', () => {
    // Prod projection of a legacy election: no type and no ballot protocol, so it can't be decoded.
    const election = createElection({ questions: [createQuestion({ type: '', ballotProtocol: undefined })] })

    const data = buildCertificateData({
      election,
      results: createResults(),
      t: plainT,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.votingProcessQuestions[0]).toMatchObject({
      totalVotes: 'Not available',
      votingMethod: 'Not available',
      submittedBallots: '10',
      choices: [
        { name: 'Approve', votes: 'Not available', percentage: 'Not available', numericVotes: null },
        { name: 'Reject', votes: 'Not available', percentage: 'Not available', numericVotes: null },
      ],
    })
  })

  it('marks results visibility as hidden when any question is secret until the end', () => {
    const election = createElection({ questions: [createQuestion({ secretUntilTheEnd: true })] })

    const data = buildCertificateData({
      election,
      results: createResults(),
      t: plainT,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.generalInformation.find((field) => field.label === 'Results visibility')?.value).toBe(
      'Hidden until the end'
    )
  })

  it('hides question results while secret-until-end processes are not in final results', () => {
    const election = createElection({
      questions: [createQuestion({ secretUntilTheEnd: true, status: 'ENDED' })],
    })

    const data = buildCertificateData({
      election,
      results: createResults({ questions: [createQuestionResults({ finalResults: false })] }),
      t: translate,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.resultsHiddenText).toBe('Results are hidden until the process reaches the final results stage.')
    expect(data.votingProcessQuestions).toEqual([])
  })

  it('always reports the memberbase credentials census with its auth and 2FA setup', () => {
    const election = createElection({
      census: { size: 100, authFields: ['name', 'memberNumber', 'nationalId'], twoFaFields: ['email'] },
    })
    const translations: Record<string, string> = {
      'members.fields.firstname': 'Nom',
      'members.fields.member_number': 'Número de soci',
      'members.fields.national_id': "Document d'Identitat",
    }

    const data = buildCertificateData({
      election,
      results: createResults(),
      t: ((key: string, options?: { defaultValue?: string }) =>
        translations[key] ?? options?.defaultValue ?? key) as never,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.authentication.find((field) => field.label === 'Authentication method')?.value).toBe(
      'Memberbase credentials census'
    )
    expect(data.censusParticipation.find((field) => field.label === 'Census source')?.value).toBe(
      'Memberbase credentials census'
    )
    expect(data.authentication.find((field) => field.label === 'Required voter credentials')?.value).toBe(
      "Nom, Número de soci, Document d'Identitat"
    )
    expect(data.authentication.find((field) => field.label === 'Additional identity check')?.value).toBe(
      'Enabled: voters confirm their identity with a one-time code sent to their personal devices.'
    )
  })

  it('certifies the anonymity mode and names the mechanism for an anonymous process', () => {
    const data = buildCertificateData({
      election: createElection({ census: { size: 100, authFields: ['memberNumber'], anonymous: true } }),
      results: createResults(),
      t: plainT,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    const row = data.authentication.find((field) => field.label === 'Voter anonymity')

    expect(row?.value).toBe('Anonymous vote · Blind signature')
    expect(row?.helperText).toContain('no vote can be traced back to a voter')
    expect(row?.helperText).toContain('blind signature')
    // The disclaimer may only claim anonymity when anonymity is actually in force.
    expect(data.disclaimerBullets).toContain('Ballot secrecy and voter anonymity are preserved by design.')
  })

  it('does not claim anonymity for a private process', () => {
    const data = buildCertificateData({
      election: createElection(),
      results: createResults(),
      t: plainT,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    const row = data.authentication.find((field) => field.label === 'Voter anonymity')

    expect(row?.value).toBe('Private vote')
    expect(row?.helperText).toContain('could still be traced back to a voter')
    expect(data.disclaimerBullets).not.toContain('Ballot secrecy and voter anonymity are preserved by design.')
    expect(data.disclaimerBullets).toContain(
      'Ballot secrecy is preserved by design; votes remain linkable to a voter identifier.'
    )
  })

  it('reports 2FA as disabled when the census configures none', () => {
    const data = buildCertificateData({
      election: createElection(),
      results: createResults(),
      t: plainT,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.authentication.find((field) => field.label === 'Additional identity check')?.value).toBe(
      'Disabled: no additional identity check has been configured in this voting process'
    )
  })

  it('includes the unified abstain bucket for multichoice questions', () => {
    const multichoiceQuestion = createQuestion({
      title: { default: 'Pick priorities' },
      type: 'multichoice',
      ballotProtocol: {
        costExponent: 1,
        costFromWeight: false,
        maxCount: 2,
        maxTotalCost: 0,
        maxValue: 2,
        maxVoteOverwrites: 0,
        uniqueValues: true,
      },
      choices: [
        { title: { default: 'Climate' }, value: 0 },
        { title: { default: 'Housing' }, value: 1 },
      ],
    })
    // Two pick-slots; columns beyond the real choices (value >= 2) are abstain sentinels:
    // Climate = 4, Housing = 3, abstain = 1 + 2 = 3
    const results = createResults({
      questions: [
        createQuestionResults({
          voteCount: 10,
          results: [
            ['4', '0', '1'],
            ['0', '3', '2'],
          ],
        }),
      ],
    })

    const data = buildCertificateData({
      election: createElection({ questions: [multichoiceQuestion] }),
      results,
      t: translate,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.votingProcessQuestions[0].votingMethod).toBe('Multiple choice')
    expect(data.votingProcessQuestions[0].choices).toEqual([
      { name: 'Climate', votes: '4', percentage: '40.0%', numericVotes: 4 },
      { name: 'Housing', votes: '3', percentage: '30.0%', numericVotes: 3 },
      { name: 'Abstain', votes: '3', percentage: '30.0%', numericVotes: 3 },
    ])
  })

  it('drops the abstain bucket when the protocol reserves no sentinel headroom', () => {
    // maxValue 1 over 2 choices leaves no value above the last choice, so there is no
    // column an abstention could ever land in — the decoder still appends the bucket,
    // but reporting a structural zero as if voters had abstained would be a lie.
    const noAbstainQuestion = createQuestion({
      title: { default: 'Pick priorities' },
      type: 'multichoice',
      ballotProtocol: {
        costExponent: 1,
        costFromWeight: false,
        maxCount: 2,
        maxTotalCost: 0,
        maxValue: 1,
        maxVoteOverwrites: 0,
        uniqueValues: true,
      },
      choices: [
        { title: { default: 'Climate' }, value: 0 },
        { title: { default: 'Housing' }, value: 1 },
      ],
    })
    const results = createResults({
      questions: [
        createQuestionResults({
          voteCount: 10,
          results: [
            ['6', '4'],
            ['4', '6'],
          ],
        }),
      ],
    })

    const data = buildCertificateData({
      election: createElection({ questions: [noAbstainQuestion] }),
      results,
      t: translate,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.votingProcessQuestions[0].choices).toEqual([
      { name: 'Climate', votes: '10', percentage: '50.0%', numericVotes: 10 },
      { name: 'Housing', votes: '10', percentage: '50.0%', numericVotes: 10 },
    ])
  })

  it('separates voter participation from weighted voting-power totals', () => {
    const election = createElection({
      census: { size: 3, weighted: true, totalWeight: 20, authFields: ['memberNumber'] },
    })
    const results = createResults({
      questions: [createQuestionResults({ voteCount: 2, results: [['7', '3']] })],
    })

    const data = buildCertificateData({
      election,
      results,
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

  it('divides the multichoice histogram by its pick slots before reporting weighted power', () => {
    // Weighted census totalling 20; two voters of weight 7 and 3 each cast one
    // ballot picking a single option on a 2-slot multichoice question. Each
    // ballot fills both slots (the unused one lands in abstain), so the columns
    // total 20 — twice the 10 of voting power actually cast. Reporting the raw
    // column total renders 100% participation for what is really 50%.
    const election = createElection({
      census: { size: 2, weighted: true, totalWeight: 20, authFields: ['memberNumber'] },
      questions: [
        createQuestion({
          title: { default: 'Pick priorities' },
          type: 'multichoice',
          ballotProtocol: {
            costExponent: 1,
            costFromWeight: false,
            maxCount: 2,
            maxTotalCost: 0,
            maxValue: 2,
            maxVoteOverwrites: 0,
            uniqueValues: true,
          },
          choices: [
            { title: { default: 'Climate' }, value: 0 },
            { title: { default: 'Housing' }, value: 1 },
          ],
        }),
      ],
    })
    const results = createResults({
      questions: [
        createQuestionResults({
          voteCount: 2,
          results: [
            ['7', '3', '0'],
            ['0', '0', '10'],
          ],
        }),
      ],
    })

    const data = buildCertificateData({
      election,
      results,
      t: translate,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.censusParticipation.find((field) => field.label === 'Voting power used')?.value).toBe('10')
    expect(data.censusParticipation.find((field) => field.label === 'Weighted participation')?.value).toBe('50.00%')
    expect(data.votingProcessQuestions[0]).toMatchObject({
      totalVotes: '10',
      votingPowerUsed: '10',
      eligibleVotingPower: '20',
      votingMethod: 'Multiple choice with weighted voting',
    })
  })

  it('degrades weighted power values to not-available when totalWeight is absent (list reads)', () => {
    const election = createElection({
      census: { size: 3, weighted: true, authFields: ['memberNumber'] },
    })
    const results = createResults({
      questions: [createQuestionResults({ voteCount: 2, results: [['7', '3']] })],
    })

    const data = buildCertificateData({
      election,
      results,
      t: translate,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.censusParticipation.find((field) => field.label === 'Total eligible voting power')?.value).toBe(
      'Not available'
    )
    expect(data.censusParticipation.find((field) => field.label === 'Weighted participation')?.value).toBe(
      'Not available'
    )
    expect(data.votingProcessQuestions[0].eligibleVotingPower).toBe('Not available')
    expect(data.votingProcessQuestions[0].choices[0].eligiblePowerPercentage).toBeUndefined()
  })

  it('summarizes multi-question voting power as a range in section 4', () => {
    const election = createElection({
      census: { size: 5, weighted: true, totalWeight: 20 },
      questions: [
        createQuestion({ title: { default: 'First weighted proposal' } }),
        createQuestion({ id: 'question-2', title: { default: 'Second weighted proposal' } }),
      ],
    })
    const results = createResults({
      questions: [
        createQuestionResults({ voteCount: 3, results: [['7', '3']] }),
        createQuestionResults({ questionId: 'question-2', voteCount: 3, results: [['2', '3']] }),
      ],
    })

    const data = buildCertificateData({
      election,
      results,
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
        { name: 'Approve', votingPower: '2', castPowerPercentage: '40.0%', eligiblePowerPercentage: '10.0%' },
        { name: 'Reject', votingPower: '3', castPowerPercentage: '60.0%', eligiblePowerPercentage: '15.0%' },
      ],
    })
  })
})

describe('resolveReportElection', () => {
  it('re-fetches the detail read for a weighted census missing totalWeight', async () => {
    const listElection = createElection({ census: { size: 3, weighted: true } })
    const detailElection = createElection({ census: { size: 3, weighted: true, totalWeight: 20 } })
    const get = vi.fn().mockResolvedValue(detailElection)

    await expect(resolveReportElection({ elections: { get } }, listElection)).resolves.toBe(detailElection)
    expect(get).toHaveBeenCalledWith(listElection.id)
  })

  it('re-reads the process even when nothing is missing, so the report never certifies a cached copy', async () => {
    const cached = createElection()
    const fresh = createElection({ questions: [createQuestion({ status: 'RESULTS' })] })
    const get = vi.fn().mockResolvedValue(fresh)

    await expect(resolveReportElection({ elections: { get } }, cached)).resolves.toBe(fresh)
    expect(get).toHaveBeenCalledWith(cached.id)
  })

  it('falls back to the given election when the fetch fails', async () => {
    const listElection = createElection({ census: { size: 3, weighted: true } })
    const get = vi.fn().mockRejectedValue(new Error('offline'))

    await expect(resolveReportElection({ elections: { get } }, listElection)).resolves.toBe(listElection)
  })

  it('falls back to the given election when the fresh read is no longer downloadable', async () => {
    const cached = createElection()
    const get = vi.fn().mockResolvedValue({ ...createElection(), published: false })

    await expect(resolveReportElection({ elections: { get } }, cached)).resolves.toBe(cached)
  })
})
