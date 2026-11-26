import { makeMembers } from './helpers/data'
import {
  authenticateVoterWithOtp,
  castVote,
  createAndPublishTwoFactorProcess,
  importMembers,
  signUpWithOrganization,
  voterScreen,
  waitForHydration,
} from './helpers/flows'
import { expect, prepareContext, test } from './helpers/fixtures'

/**
 * Flow 6 — "Check your vote" after the vote has ended, from another device.
 *
 * A member votes on a plain (non-anonymous) CSP + email 2FA census. Once the vote is over, a context with no storage
 * (another device) opens the public page, which shows the closed screen, asks to check the vote, identifies the same
 * member again and must get the same receipt codes back. Whether the CSP still authenticates a voter after the end
 * is the backend's call, so a refusal fails the test naming the step and the HTTP error.
 */

// Minutes from publishing the form until the vote closes. Long enough for the publish and one vote (about two
// minutes on CI), short enough to keep the spec near ten minutes: the picker works in whole minutes and a vote's end
// cannot be moved after publishing.
const ENDS_IN_MINUTES = 5

const receiptCodes = async (screen: ReturnType<typeof voterScreen>): Promise<string[]> => {
  const links = screen.locator('a[href*="/verify/"]')
  await expect(links.first()).toBeVisible()
  const hrefs = await links.evaluateAll((anchors) => anchors.map((anchor) => (anchor as HTMLAnchorElement).href))
  return hrefs.map((href) => href.split('/verify/')[1]).sort()
}

test.describe('checking a vote after it ended', () => {
  // Signup, import, publish and a vote (about three minutes), then the wait for the end, then the check. The default
  // five minutes cannot hold the wait for the vote to close.
  test.setTimeout(12 * 60_000)

  test('a member sees their receipt codes from another device once the vote is over', async ({ page, browser }) => {
    const seed = String(Date.now()).slice(-6)
    const members = makeMembers(3, seed)
    const [member] = members

    // --- organizer -------------------------------------------------------
    await signUpWithOrganization(page, `Check Org ${seed}`)
    await importMembers(page, members)
    const processId = await createAndPublishTwoFactorProcess(page, {
      title: `E2E check ${seed}`,
      questions: [{ title: 'Do you approve?', choices: [{ label: 'Yes' }, { label: 'No' }] }],
      endsInMinutes: ENDS_IN_MINUTES,
    })
    expect(processId).toBeTruthy()

    // --- first device: vote ----------------------------------------------
    const firstContext = await browser.newContext()
    await prepareContext(firstContext)
    let castCodes: string[]
    try {
      const first = await firstContext.newPage()
      await first.goto(`/processes/${processId}`)
      await authenticateVoterWithOtp(first, member)
      await castVote(first, 0)
      castCodes = await receiptCodes(first.getByTestId('vote-receipt'))
      expect(castCodes.length).toBeGreaterThan(0)
    } finally {
      await firstContext.close()
    }

    // --- second device: no storage, after the end ------------------------
    const secondContext = await browser.newContext()
    await prepareContext(secondContext)
    try {
      const second = await secondContext.newPage()
      const failures: string[] = []
      second.on('response', (response) => {
        if (response.status() >= 400)
          failures.push(`${response.status()} ${response.request().method()} ${response.url()}`)
      })
      const withFailures = (step: string, error: unknown) =>
        new Error(
          `${step} failed: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}. ` +
            `HTTP errors seen on this device: ${failures.length ? failures.join('; ') : 'none'}`
        )

      await second.goto(`/processes/${processId}`)

      // Wait for the end by reading the page, not by sleeping: reload until the closed screen shows.
      try {
        await expect(async () => {
          await second.reload()
          await expect(voterScreen(second, 'closed')).toBeVisible({ timeout: 10_000 })
        }).toPass({ timeout: 8 * 60_000, intervals: [10_000] })
      } catch (error) {
        throw withFailures('Step 3 (waiting for the vote to end and show the closed screen)', error)
      }

      try {
        // Another device holds no CSP session, so the closed screen offers the check.
        const checkVote = second.getByTestId('voter-check-vote')
        await waitForHydration(checkVote, 30_000)
        await checkVote.click()
        await authenticateVoterWithOtp(second, member, 'alreadyVoted')
      } catch (error) {
        throw withFailures('Step 4 (identifying with the CSP after the end to check the vote)', error)
      }

      const checkedCodes = await receiptCodes(voterScreen(second, 'alreadyVoted'))
      expect(checkedCodes).toEqual(castCodes)
    } finally {
      await secondContext.close()
    }
  })
})
