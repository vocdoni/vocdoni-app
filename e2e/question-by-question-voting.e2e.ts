import { makeMembers } from './helpers/data'
import {
  castOpenQuestion,
  closeQuestion,
  createAndPublishTwoFactorProcess,
  endVote,
  identifyWithMemberNumber,
  importMembers,
  openQuestion,
  receiptCodes,
  signUpWithOrganization,
  voterScreen,
} from './helpers/flows'
import { expect, prepareContext, test } from './helpers/fixtures'

/**
 * Flow 7: a question-by-question vote, from both sides.
 *
 * The organiser opens and closes the questions in turn; the voter's page follows by itself (it polls the
 * process every 10 seconds with jitter while the vote is live, every 30 outside it; every "auto" wait below gives it
 * 90). Covers every room frame the voter can reach: not started, the open question, cast, the closed question's result,
 * skipped, parked ("Vota ara") and missed, then the closed vote, its results and the receipt checked from another device.
 *
 * Needs the app server to run with QUESTION_BY_QUESTION (playwright.config.ts sets it).
 */

/** A frame follows the organiser's change with no reload: one poll, with its jitter, and some slack. */
const AUTO = { timeout: 90_000 }

const QUESTIONS = ['First question', 'Second question', 'Third question'].map((title) => ({
  title,
  choices: [{ label: 'Yes' }, { label: 'No' }] as [{ label: string }, { label: string }],
}))

test.describe('question-by-question voting', () => {
  // Signup, publish, three opens and closes, five waits on the voter's poll and a check from another device.
  test.setTimeout(25 * 60_000)

  test('the voter follows the organiser through every question of the vote', async ({ page, browser }) => {
    const seed = String(Date.now()).slice(-6)
    const members = makeMembers(3, seed)
    const [member] = members

    // --- 1. organiser ------------------------------------------------------
    await signUpWithOrganization(page, `QbQ Org ${seed}`)
    await importMembers(page, members)
    const processId = await createAndPublishTwoFactorProcess(page, {
      title: `E2E question by question ${seed}`,
      questions: QUESTIONS,
      startPaused: true,
      voterResults: true,
      // Credentials only: the journey does not wait on email.
      twoFactor: false,
    })
    expect(processId).toBeTruthy()

    const voterContext = await browser.newContext()
    await prepareContext(voterContext)
    const voter = await voterContext.newPage()

    try {
      // --- 2. voter identifies first, as in an all-at-once vote ---------------
      await voter.goto(`/processes/${processId}`)
      await identifyWithMemberNumber(voter, member, 'roomNotStarted')

      // --- 3. every sign-batch request of the voter ---------------------------
      const signBatches: number[] = []
      voter.on('request', (request) => {
        if (!request.url().includes('/sign-batch')) return
        const body = request.postDataJSON() as { ballots?: unknown[] } | null
        signBatches.push(body?.ballots?.length ?? -1)
      })

      // --- 4. the first question opens ---------------------------------------
      await openQuestion(page, processId, 0)
      await expect(voterScreen(voter, 'roomQuestion')).toBeVisible(AUTO)
      await expect(voterScreen(voter, 'roomQuestion').getByRole('heading', { level: 1 })).toHaveText(QUESTIONS[0].title)

      // --- 5. cast it: one ballot, and the room says so ----------------------
      await castOpenQuestion(voter, 0)
      expect(signBatches).toEqual([1])

      // --- 6. between questions ----------------------------------------------
      // The vote shows its results per question, so the voter who cast the first one sees it closed with its result
      // (frame 3e) until the next question opens, not the none-open frame.
      await closeQuestion(page, processId, 0)
      await expect(voterScreen(voter, 'roomClosedVoted')).toBeVisible(AUTO)
      await expect(voterScreen(voter, 'roomClosedVoted').getByRole('heading', { level: 1 })).toHaveText(
        'Question 1 has closed'
      )
      // The card shows once the tally is public: the organiser's count, polled by the voter.
      await expect(voterScreen(voter, 'roomClosedVoted').getByRole('region', { name: 'Result' })).toBeVisible({
        timeout: 120_000,
      })
      await openQuestion(page, processId, 1)
      await expect(voterScreen(voter, 'roomQuestion')).toBeVisible(AUTO)
      await expect(voterScreen(voter, 'roomQuestion').getByRole('heading', { level: 1 })).toHaveText(QUESTIONS[1].title)

      // --- 7. skip, come back, park, resume: nothing is sent ------------------
      await voterScreen(voter, 'roomQuestion')
        .getByRole('button', { name: /do not vote on this question/i })
        .click()
      await expect(voterScreen(voter, 'roomSkipped')).toBeVisible()
      // The outline button in the column ("Vote on question 2").
      await voterScreen(voter, 'roomSkipped')
        .getByRole('button', { name: /^Vote on question 2$/ })
        .click()
      await expect(voterScreen(voter, 'roomQuestion')).toBeVisible()
      // The action bar's secondary leaves the ballot for the room, its primary goes back to it.
      await voterScreen(voter, 'roomQuestion')
        .locator('[data-scope="action-bar"]')
        .getByRole('button', { name: /^Back$/ })
        .click()
      await expect(voterScreen(voter, 'roomOpen')).toBeVisible()
      await voterScreen(voter, 'roomOpen')
        .locator('[data-scope="action-bar"]')
        .getByRole('button', { name: /^Vote now$/ })
        .click()
      await expect(voterScreen(voter, 'roomQuestion')).toBeVisible()

      // --- 8. it closes unvoted ------------------------------------------------
      await closeQuestion(page, processId, 1)
      await expect(voterScreen(voter, 'roomMissed')).toBeVisible(AUTO)
      // Skipping cast nothing: no sign-batch request since step 5.
      expect(signBatches).toEqual([1])

      // --- 9. the third question, cast with the second choice ------------------
      await openQuestion(page, processId, 2)
      await expect(voterScreen(voter, 'roomQuestion')).toBeVisible(AUTO)
      await expect(voterScreen(voter, 'roomQuestion').getByRole('heading', { level: 1 })).toHaveText(QUESTIONS[2].title)
      await castOpenQuestion(voter, 1)
      expect(signBatches).toEqual([1, 1])

      // --- 10. the vote ends; the voter's page moves to the closed screen -----
      // Closing the last question closes the vote too, so `endVote` has nothing left to click then.
      await closeQuestion(page, processId, 2)
      await endVote(page, processId)
      await expect(voterScreen(voter, 'closed')).toBeVisible(AUTO)
      await voterScreen(voter, 'closed')
        .getByRole('button', { name: /^Show the results$/ })
        .click()
      await expect(voterScreen(voter, 'results')).toBeVisible()

      // --- 11. another device checks the receipt: questions 1 and 3 ------------
      const otherContext = await browser.newContext()
      await prepareContext(otherContext)
      try {
        const other = await otherContext.newPage()
        await other.goto(`/processes/${processId}`)
        await expect(voterScreen(other, 'closed')).toBeVisible({ timeout: 60_000 })
        await other.getByTestId('voter-check-vote').click()
        await identifyWithMemberNumber(other, member, 'alreadyVoted')
        expect(await receiptCodes(voterScreen(other, 'alreadyVoted'))).toHaveLength(2)
      } finally {
        await otherContext.close()
      }

      // --- 12. an observer reads the per-question counts -----------------------
      const observerContext = await browser.newContext()
      await prepareContext(observerContext)
      try {
        const observer = await observerContext.newPage()
        await observer.goto(`/processes/${processId}`)
        await expect(voterScreen(observer, 'closed')).toBeVisible({ timeout: 60_000 })
        await observer.getByRole('button', { name: /^Show the results$/ }).click()
        const results = voterScreen(observer, 'results')
        await expect(results).toBeVisible()
        const questionResult = (title: string) =>
          results.locator('section').filter({ has: observer.getByRole('heading', { level: 2, name: title }) })
        await expect(questionResult(QUESTIONS[0].title)).toContainText(/\b1 vote\b/, { timeout: 120_000 })
        await expect(questionResult(QUESTIONS[1].title)).not.toContainText(/\b[1-9]\d* votes?\b/)
        await expect(questionResult(QUESTIONS[2].title)).toContainText(/\b1 vote\b/, { timeout: 120_000 })
      } finally {
        await observerContext.close()
      }
    } finally {
      await voterContext.close()
    }
  })
})
