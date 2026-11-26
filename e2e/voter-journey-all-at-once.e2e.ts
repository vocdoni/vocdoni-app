import { makeMembers } from './helpers/data'
import {
  authenticateVoterWithOtp,
  createAndPublishTwoFactorProcess,
  endVote,
  importMembers,
  pauseVote,
  receiptCodes,
  resumeVote,
  signUpWithOrganization,
  submitBallot,
  voterScreen,
} from './helpers/flows'
import { expect, prepareContext, test } from './helpers/fixtures'

/**
 * Flow 8: the all-at-once voter journey, end to end, with the screens the other specs skip.
 *
 * Email 2FA census of two single-choice questions. The voter walks welcome, both questions, review, "Change" on the
 * first question, cast and the receipt; identifies again after a reload for the already-voted screen and the
 * provisional results; a second member sees the paused screen and is moved on when the organiser resumes; the end
 * brings the closed screen and the final results. The voter's page polls the process every 30 seconds with jitter, so
 * every "auto" wait gives it 90.
 */

/** A screen follows the organiser's change with no reload: one poll, with its jitter, and some slack. */
const AUTO = { timeout: 90_000 }

const QUESTIONS = [
  { title: 'First question', choices: [{ label: 'Agree first' }, { label: 'Disagree first' }] },
  { title: 'Second question', choices: [{ label: 'Agree second' }, { label: 'Disagree second' }] },
] as [
  { title: string; choices: [{ label: string }, { label: string }] },
  { title: string; choices: [{ label: string }, { label: string }] },
]

test.describe('the all-at-once voter journey', () => {
  // Signup, publish, a vote, a second identification, a pause and the end with its count.
  test.setTimeout(25 * 60_000)

  test('a member votes, changes an answer, checks the vote and follows pause and end', async ({ page, browser }) => {
    const seed = String(Date.now()).slice(-6)
    const members = makeMembers(3, seed)
    const [first, second] = members

    // --- 1. organiser ------------------------------------------------------
    await signUpWithOrganization(page, `Journey Org ${seed}`)
    await importMembers(page, members)
    const processId = await createAndPublishTwoFactorProcess(page, {
      title: `E2E journey ${seed}`,
      questions: QUESTIONS,
      voterResults: true,
    })
    expect(processId).toBeTruthy()

    const voterContext = await browser.newContext()
    await prepareContext(voterContext)
    const voter = await voterContext.newPage()
    const secondContext = await browser.newContext()
    await prepareContext(secondContext)
    const secondVoter = await secondContext.newPage()

    /** Picks the ballot value on the question on display and moves on. */
    const answer = async (value: number) => {
      const question = voterScreen(voter, 'question')
      // The fields stay disabled until the SDK reports the voter able to vote, which can land after identification.
      await expect(question.locator('input[type="radio"]').first()).toBeEnabled({ timeout: 60_000 })
      await question.locator(`input[type="radio"][value="${value}"]`).check({ force: true })
      await voter.getByTestId('voter-continue').click()
    }

    try {
      // --- 2. welcome, both questions, review, change, cast ------------------
      await voter.goto(`/processes/${processId}`)
      await authenticateVoterWithOtp(voter, first)
      await voterScreen(voter, 'welcome').locator('[data-scope="action-bar"] button').first().click()
      await answer(0)
      await answer(0)
      const review = voterScreen(voter, 'review')
      await expect(review).toBeVisible({ timeout: 30_000 })
      await expect(review).toContainText('Agree first')

      // "Change" on question 1 goes back to its ballot; "Continua" returns to the review with the new answer.
      await review.getByRole('button', { name: /^Change your answer to First question$/ }).click()
      await expect(voterScreen(voter, 'question')).toBeVisible()
      await answer(1)
      await expect(voterScreen(voter, 'review')).toBeVisible({ timeout: 30_000 })
      await expect(voterScreen(voter, 'review')).toContainText('Disagree first')

      await submitBallot(voter)
      const castCodes = await receiptCodes(voter.getByTestId('vote-receipt'))
      expect(castCodes).toHaveLength(2)

      // --- 3. identify again: the vote is on chain, and the results are provisional
      // A voter's CSP session does not survive a reload.
      await voter.reload()
      await authenticateVoterWithOtp(voter, first, 'alreadyVoted')
      expect(await receiptCodes(voterScreen(voter, 'alreadyVoted'))).toEqual(castCodes)
      await voterScreen(voter, 'alreadyVoted')
        .getByRole('button', { name: /^Show the results$/ })
        .click()
      const results = voterScreen(voter, 'results')
      await expect(results).toBeVisible()
      await expect(results.getByRole('heading', { level: 1, name: 'Provisional results' })).toBeVisible()
      await expect(voter.getByTestId('process-vote-count')).toContainText(/^1\b/, { timeout: 120_000 })
      await results
        .locator('[data-scope="action-bar"]')
        .getByRole('button', { name: /^Back$/ })
        .click()
      await expect(voterScreen(voter, 'alreadyVoted')).toBeVisible()

      // --- 4. paused: a second member waits, and moves on by itself on resume
      await pauseVote(page, processId)
      await secondVoter.goto(`/processes/${processId}`)
      await authenticateVoterWithOtp(secondVoter, second, 'paused')
      await resumeVote(page, processId)
      await expect(voterScreen(secondVoter, 'welcome')).toBeVisible(AUTO)

      // --- 5. the end: closed, then the final results -------------------------
      await endVote(page, processId)
      await expect(voterScreen(voter, 'closed')).toBeVisible(AUTO)
      await voterScreen(voter, 'closed')
        .getByRole('button', { name: /^Show the results$/ })
        .click()
      await expect(voterScreen(voter, 'results')).toBeVisible()
      // The chain marks every tally final a little after the end; until then the heading says it is counting.
      await expect(voterScreen(voter, 'results').getByRole('heading', { level: 1, name: 'Final results' })).toBeVisible(
        {
          timeout: 180_000,
        }
      )
    } finally {
      await secondContext.close()
      await voterContext.close()
    }
  })
})
