/**
 * PDF generator for manual inspection.
 * Usage:
 *   PROCESS_ID=<id> VOCDONI_ENV=dev|stg|prod pnpm vitest run src/.../gen-pdf.test.tsx
 * Output: /tmp/gen-<id>.pdf  +  printed section-5 data summary
 */
import { describe, it } from 'vitest'
import * as ReactPDF from '@react-pdf/renderer'
import fs from 'fs'
import { VocdoniSDKClient, EnvOptions, PublishedElection } from '@vocdoni/sdk'
import i18next from 'i18next'
import { VotingCertificateDocument } from './pdf-document'
import {
  buildCertificateData,
  resolveCensusMetadata,
  resolveReportCensusType,
  isCspReportCensus,
  fetchCensusBundle,
} from './certificate-data'

const { pdf } = ReactPDF

const collect = (s: any): Promise<Buffer> =>
  new Promise((res, rej) => {
    const c: Buffer[] = []
    s.on('data', (b: Buffer) => c.push(b))
    s.on('end', () => res(Buffer.concat(c)))
    s.on('error', rej)
  })

const PROCESS_ID = process.env.PROCESS_ID ?? ''
const ENV_KEY = (process.env.VOCDONI_ENV ?? 'prod').toUpperCase() as keyof typeof EnvOptions
const API_URL = process.env.VOCDONI_API_URL // optional override, e.g. https://one-dev.vocdoni.net/v2

describe.skipIf(!PROCESS_ID)('PDF generator', () => {
  it(`generates PDF for ${PROCESS_ID}`, async () => {
    if (!i18next.isInitialized) await i18next.init({ lng: 'en', resources: {} })
    const t = i18next.t.bind(i18next) as any

    const client = new VocdoniSDKClient({
      env: EnvOptions[ENV_KEY] ?? EnvOptions.PROD,
      ...(API_URL ? { api_url: API_URL } : {}),
    })
    const election = (await client.fetchElection(PROCESS_ID)) as PublishedElection

    console.log('\n=== Election ===')
    console.log('Title       :', election.title?.default)
    console.log('Status      :', election.status)
    console.log('voteCount   :', election.voteCount)
    console.log('Census type :', election.census?.type)
    console.log('Census size :', election.census?.size)
    console.log('Census weight:', (election.census as any)?.weight)
    console.log('ResultsType :', JSON.stringify(election.resultsType))
    console.log('Results     :', JSON.stringify(election.results))
    console.log('Meta        :', JSON.stringify(election.meta))
    console.log('Questions   :', election.questions.length)

    const censusMeta = resolveCensusMetadata(election)
    const censusType = resolveReportCensusType(election, censusMeta)
    const censusBundle = isCspReportCensus(censusType)
      ? await fetchCensusBundle((election.census as any)?.censusURI)
      : null

    const data = buildCertificateData({
      report: { election },
      t,
      organizationName: undefined,
      explorerUrl: `https://dev.explorer.vote`,
      censusBundle,
      now: new Date(),
    })

    console.log('\n=== Section 5 data ===')
    console.log('isWeighted       :', data.isWeighted)
    console.log('resultValueLabel :', data.resultValueLabel)
    console.log('questionTotalLabel:', data.questionTotalLabel)
    console.log('resultsHiddenText:', data.resultsHiddenText)
    data.votingProcessQuestions.forEach((q, i) => {
      console.log(`\n  Question ${i + 1}: ${q.question}`)
      console.log('    isWeighted        :', q.isWeighted)
      console.log('    totalVotes        :', q.totalVotes)
      console.log('    votingMethod      :', q.votingMethod)
      console.log('    countingBasisLabel:', q.countingBasisLabel)
      console.log('    submittedBallots  :', q.submittedBallots)
      console.log('    votingPowerUsed   :', q.votingPowerUsed)
      console.log('    eligibleVotingPower:', q.eligibleVotingPower)
      q.choices.forEach((c) => {
        console.log(`    choice: ${c.name}`)
        console.log(`      votes=${c.votes}  pct=${c.percentage}  numericVotes=${c.numericVotes}`)
        if (q.isWeighted) {
          console.log(
            `      votingPower=${c.votingPower}  castPct=${c.castPowerPercentage}  eligiblePct=${c.eligiblePowerPercentage}`
          )
        }
      })
    })

    const captured: Record<string, number> = {}
    await collect(
      await pdf(
        <VotingCertificateDocument
          data={data}
          t={t}
          onCapturePage={(id: string, n: number) => {
            captured[id] = n
          }}
        />
      ).toBuffer()
    )

    const buf = await collect(
      await pdf(<VotingCertificateDocument data={data} t={t} capturedPages={captured} />).toBuffer()
    )

    const outPath = `/tmp/gen-${PROCESS_ID.slice(0, 12)}.pdf`
    fs.writeFileSync(outPath, buf)
    console.log(`\nPDF written → ${outPath}`)
  }, 60000)
})
