import { makeMembers } from './helpers/data'
import {
  authenticateVoterWithOtp,
  castVote,
  createAndPublishTwoFactorProcess,
  importMembers,
  openPublicCount,
  signUpWithOrganization,
} from './helpers/flows'
import { expect, prepareContext, test } from './helpers/fixtures'
import { MailSubjects, waitForEmail } from './helpers/mailhog'

/**
 * Flow 4 — voting on an anonymous (blind CSP) census.
 *
 * Same journey as the CSP + 2FA flow, with one difference that changes the
 * whole cryptographic path: the organizer picks anonymous ballots, so the CSP
 * blind-signs a ballot it never sees (`blindPoint` → `blindSign`, a
 * `ECDSA_BLIND_PIDSALTED` proof) instead of signing the voter's address.
 *
 * Worth its own suite because nothing else exercises that path end to end, and
 * because a blind signature that is byte-wrong is rejected on chain with no
 * useful diagnostic — the vote count below is the only honest evidence it
 * worked.
 */
test.describe('voting on an anonymous census', () => {
  test('a member blind-signs a ballot and casts it', async ({ page, browser }) => {
    const seed = String(Date.now()).slice(-6)
    const members = makeMembers(3, seed)
    const organizationName = `Anon Org ${seed}`

    // --- organizer -------------------------------------------------------
    await signUpWithOrganization(page, organizationName)
    await importMembers(page, members)

    const processId = await createAndPublishTwoFactorProcess(page, {
      title: `E2E anon ${seed}`,
      questions: [{ title: 'Do you approve?', choices: [{ label: 'Yes' }, { label: 'No' }] }],
      anonymous: true,
      voterResults: true,
    })
    expect(processId).toBeTruthy()

    // --- voter -----------------------------------------------------------
    const voterContext = await browser.newContext()
    await prepareContext(voterContext)
    const voter = await voterContext.newPage()

    try {
      const [member] = members

      await voter.goto(`/processes/${processId}`)
      await expect(voter.getByRole('heading', { name: `E2E anon ${seed}` }).first()).toBeVisible()

      const requestedAt = new Date()
      await authenticateVoterWithOtp(voter, member)

      // Authentication is unchanged by anonymity: the CSP still identifies the
      // member, it just never learns which ballot they then cast.
      await waitForEmail({
        to: member.email,
        subject: MailSubjects.twoFactorChallenge,
        since: requestedAt,
      })

      await castVote(voter, 0)

      // The receipt is a one-time thing on an anonymous census, and the receipt
      // screen says so: this is the only moment the voter can save it. The warning
      // is the receipt's one non-empty status region, so the check does not depend on copy.
      await expect(voter.getByTestId('vote-receipt').getByRole('status').filter({ hasText: /\S/ })).toBeVisible()

      // The envelope carried a valid blind signature and the chain accepted it:
      // read the count back in a session that never authenticated.
      const observerContext = await browser.newContext()
      await prepareContext(observerContext)
      try {
        const observer = await observerContext.newPage()
        await observer.goto(`/processes/${processId}`)
        await expect(await openPublicCount(observer)).toContainText(/^1\b/, { timeout: 120_000 })
      } finally {
        await observerContext.close()
      }
    } finally {
      await voterContext.close()
    }
  })
})
