import type { Page } from '@playwright/test'
import { makeMembers } from './helpers/data'
import {
  castVote,
  createAndPublishTwoFactorProcess,
  importMembers,
  openIdentifyModal,
  signUpWithOrganization,
  submitPasswordLogin,
} from './helpers/flows'
import { expect, prepareContext, test } from './helpers/fixtures'

/**
 * Voting on a census that authenticates members by member number + password.
 *
 * The organizer sets the passwords through the CSV import; the voter logs in with
 * them. A member password must never leave the browser in plaintext — the app
 * sends only its hash, salted with the organization address — so every request
 * either browser makes is recorded and checked for the plaintext. The org address
 * reaches the two sides in different forms (0x-prefixed on the admin side, bare on
 * the process page), so a successful login also proves both hash the same value.
 */
test.describe('voting with a member password census', () => {
  test('a member logs in with their password and votes; a wrong password is refused', async ({ page, browser }) => {
    const seed = String(Date.now()).slice(-6)
    const members = makeMembers(3, seed).map((member, index) => ({ ...member, password: `Pw-${seed}-${index + 1}` }))
    const wrongPassword = `Wrong-${seed}`
    const title = `E2E password ${seed}`

    const sentBodies: string[] = []
    const recordRequestBodies = (target: Page) =>
      target.on('request', (request) => {
        const body = request.postData()
        if (body) sentBodies.push(body)
      })
    recordRequestBodies(page)

    // --- organizer -------------------------------------------------------
    await signUpWithOrganization(page, `Password Org ${seed}`)
    await importMembers(page, members)
    const processId = await createAndPublishTwoFactorProcess(page, {
      title,
      questions: [{ title: 'Do you approve?', choices: [{ label: 'Yes' }, { label: 'No' }] }],
      credentials: ['memberNumber', 'password'],
      twoFactor: false,
    })
    expect(processId).toBeTruthy()

    // --- voter -----------------------------------------------------------
    const voterContext = await browser.newContext()
    await prepareContext(voterContext)
    const voter = await voterContext.newPage()
    recordRequestBodies(voter)

    try {
      const [member] = members
      await voter.goto(`/processes/${processId}`)
      await expect(voter.getByRole('heading', { name: title }).first()).toBeVisible()

      const dialog = await openIdentifyModal(voter)
      await expect(dialog.locator('input[name="password"]')).toHaveAttribute('type', 'password')

      // A wrong password gets the same password-aware answer as someone outside the census.
      await submitPasswordLogin(dialog, member.memberNumber, wrongPassword)
      await expect(
        dialog.getByText(/couldn.t verify your identity\. Check your credentials and your password/i).first()
      ).toBeVisible({ timeout: 30_000 })

      // The right one logs in straight away: no 2FA on this census.
      await submitPasswordLogin(dialog, member.memberNumber, member.password)
      await expect(dialog).toBeHidden({ timeout: 60_000 })

      await castVote(voter, 0)

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

    // No request either browser sent carried a plaintext password.
    const sent = sentBodies.join('\n')
    for (const secret of [...members.map((member) => member.password), wrongPassword]) {
      expect(sent).not.toContain(secret)
    }
  })
})
