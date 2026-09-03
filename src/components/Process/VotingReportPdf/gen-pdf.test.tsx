/**
 * PDF generator for manual inspection, driven by the SaaS API (new-model processes).
 * Usage:
 *   PROCESS_ID=<mongoId> AUTH_TOKEN=<jwt> [SAAS_URL=https://saas-api-dev.vocdoni.net] \
 *     pnpm vitest run src/components/Process/VotingReportPdf/gen-pdf.test.tsx
 * Alternatively pass AUTH_EMAIL/AUTH_PASSWORD to log in instead of AUTH_TOKEN.
 * The process read is Bearer-authed; results are public.
 * Output: /tmp/gen-<id>.pdf  +  printed section-5 data summary
 */
import * as ReactPDF from '@react-pdf/renderer'
import { VocdoniApiClient } from '@vocdoni/api-client'
import fs from 'fs'
import i18next from 'i18next'
import { describe, it } from 'vitest'
import { buildCertificateData, canDownloadVotingReport, fetchProcessResults } from './certificate-data'
import { VotingCertificateDocument } from './pdf-document'

const { pdf } = ReactPDF

const collect = (s: any): Promise<Buffer> =>
  new Promise((res, rej) => {
    const c: Buffer[] = []
    s.on('data', (b: Buffer) => c.push(b))
    s.on('end', () => res(Buffer.concat(c)))
    s.on('error', rej)
  })

const PROCESS_ID = process.env.PROCESS_ID ?? ''
const SAAS_URL = process.env.SAAS_URL ?? 'https://saas-api-dev.vocdoni.net'
const EXPLORER_URL = process.env.EXPLORER_URL ?? 'https://one-dev.explorer.vote'

const resolveToken = async (): Promise<string | undefined> => {
  if (process.env.AUTH_TOKEN) return process.env.AUTH_TOKEN
  if (process.env.AUTH_EMAIL && process.env.AUTH_PASSWORD) {
    const anonymous = new VocdoniApiClient({ apiUrl: SAAS_URL })
    const session = await anonymous.auth.login(process.env.AUTH_EMAIL, process.env.AUTH_PASSWORD)
    return session.token
  }
  return undefined
}

describe.skipIf(!PROCESS_ID)('PDF generator', () => {
  it(`generates PDF for ${PROCESS_ID}`, async () => {
    if (!i18next.isInitialized) await i18next.init({ lng: 'en', resources: {} })
    const t = i18next.t.bind(i18next) as any

    const authToken = await resolveToken()
    const client = new VocdoniApiClient({ apiUrl: SAAS_URL, authToken })

    const election = await client.elections.get(PROCESS_ID)
    const results = await fetchProcessResults(client, PROCESS_ID)

    console.log('\n=== Election ===')
    console.log('Title       :', election.title?.default)
    console.log('Published   :', election.published)
    console.log('Census size :', election.census?.size)
    console.log('Weighted    :', election.census?.weighted)
    console.log('Auth fields :', JSON.stringify(election.census?.authFields))
    console.log('2FA fields  :', JSON.stringify(election.census?.twoFaFields))
    console.log('Chain id    :', election.chainId)
    console.log('Questions   :', election.questions.length)
    console.log('Statuses    :', election.questions.map((q) => q.status).join(', '))
    console.log('Results     :', JSON.stringify(results))

    if (!canDownloadVotingReport(election)) {
      throw new Error('process is not in a downloadable state (published + ENDED/CANCELED/RESULTS)')
    }

    const data = buildCertificateData({
      election,
      results,
      t,
      organizationName: undefined,
      explorerUrl: EXPLORER_URL,
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
