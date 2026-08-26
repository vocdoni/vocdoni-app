import { makeMembers } from './helpers/data'
import {
  authenticateVoterWithOtp,
  castVote,
  createAndPublishTwoFactorProcess,
  importMembers,
  openIdentifyModal,
  signUpWithOrganization,
} from './helpers/flows'
import { expect, prepareContext, test } from './helpers/fixtures'
import { inboxFor, MailSubjects, waitForEmail } from './helpers/mailhog'

/**
 * Flow 2 — voting on a CSP census with an email 2FA challenge.
 *
 * The whole journey runs through the UI: the organizer signs up, verifies,
 * creates the organization, imports a memberbase, configures voter
 * authentication and publishes; the voter then identifies, receives an OTP by
 * email, submits it and casts a ballot. Nothing is provisioned behind the app's
 * back, so a break anywhere along that chain fails here.
 */
test.describe('voting with a CSP + email 2FA census', () => {
  test('a member authenticates with an emailed OTP and casts a vote', async ({ page, browser }) => {
    const seed = String(Date.now()).slice(-6)
    const members = makeMembers(3, seed)
    const organizationName = `Voting Org ${seed}`

    // --- organizer -------------------------------------------------------
    await signUpWithOrganization(page, organizationName)
    await importMembers(page, members)

    const processId = await createAndPublishTwoFactorProcess(page, {
      title: `E2E vote ${seed}`,
      question: 'Do you approve?',
      choices: ['Yes', 'No'],
    })
    expect(processId).toBeTruthy()

    // --- voter -----------------------------------------------------------
    // A separate context, not just a new tab: the voter must not inherit the
    // organizer's session. A voter identified only by the CSP challenge is the
    // scenario under test.
    const voterContext = await browser.newContext()
    await prepareContext(voterContext)
    const voter = await voterContext.newPage()

    try {
      const [member] = members

      await voter.goto(`/processes/${processId}`)
      // The published process is public — reachable with no session at all.
      await expect(voter.getByRole('heading', { name: `E2E vote ${seed}` }).first()).toBeVisible()

      const requestedAt = new Date()
      await authenticateVoterWithOtp(voter, member)

      // The OTP mail is the reason this suite exists — assert it was a real,
      // organization-scoped 2FA challenge and not some other mail that happened
      // to reach the same inbox.
      const challenge = await waitForEmail({
        to: member.email,
        subject: MailSubjects.twoFactorChallenge,
        since: requestedAt,
      })
      expect(challenge.subject).toContain(organizationName)
      expect(challenge.body).toMatch(/verification code is:\s*\d{6}/)

      // The census counted 3 members and nobody has voted yet.
      await expect(voter.getByTestId('process-vote-count')).toContainText('0')

      await castVote(voter, 0)

      // The envelope really reached the chain, rather than the UI merely
      // reporting success: the process's own vote count — read back from the
      // API, in a brand-new session with no CSP token — now reads 1.
      //
      // A voter's CSP session deliberately does not survive a reload, so this
      // is checked from a fresh anonymous context rather than by reloading the
      // voter's page.
      const observerContext = await browser.newContext()
      await prepareContext(observerContext)
      try {
        const observer = await observerContext.newPage()
        await observer.goto(`/processes/${processId}`)
        await expect(observer.getByTestId('process-vote-count')).toContainText('1', { timeout: 120_000 })
      } finally {
        await observerContext.close()
      }
    } finally {
      await voterContext.close()
    }
  })

  test('does not email an OTP to someone outside the census', async ({ page, browser }) => {
    const seed = String(Date.now()).slice(-6)
    const members = makeMembers(3, seed)

    await signUpWithOrganization(page, `Voting Org ${seed}`)
    await importMembers(page, members)
    const processId = await createAndPublishTwoFactorProcess(page, {
      title: `E2E guard ${seed}`,
      question: 'Do you approve?',
      choices: ['Yes', 'No'],
    })

    const voterContext = await browser.newContext()
    await prepareContext(voterContext)
    const voter = await voterContext.newPage()

    try {
      const stranger = { ...members[0], memberNumber: '000000-not-a-member' }
      await voter.goto(`/processes/${processId}`)

      const dialog = await openIdentifyModal(voter)
      await dialog.locator('input[name="memberNumber"]').fill(stranger.memberNumber)
      await dialog.locator('input[name="contact"]').fill(stranger.email)
      await dialog.locator('[data-scope="checkbox"][data-part="control"]').first().click()
      await dialog.locator('button[type="submit"]').click()

      // The voter is told they are not in the census...
      await expect(dialog.getByText(/not listed in the census|incorrect/i).first()).toBeVisible({ timeout: 30_000 })

      // ...and, more importantly, no challenge was mailed. Without this, a
      // backend that mailed a code before checking membership would let anyone
      // who knows a member's address trigger mail to it.
      const inbox = await inboxFor(stranger.email)
      expect(inbox.filter((mail) => mail.subject.includes(MailSubjects.twoFactorChallenge))).toHaveLength(0)
    } finally {
      await voterContext.close()
    }
  })
})
