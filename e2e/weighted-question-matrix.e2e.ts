import { makeMembers } from './helpers/data'
import {
  authenticateVoterWithOtp,
  createAndPublishTwoFactorProcess,
  fillBallot,
  importMembers,
  openPublicCount,
  signUpWithOrganization,
  submitBallot,
  voterScreen,
} from './helpers/flows'
import { expect, prepareContext, test } from './helpers/fixtures'

/**
 * Flow 3 — the process-creation matrix from the manual QA procedure, folded
 * into a single journey.
 *
 * The original checklist crossed census types (memberbase, spreadsheet, web3)
 * with question types and presentations. Two of those axes no longer exist:
 * the wizard only builds memberbase/CSP censuses now, and question type +
 * extended info became per-question settings — every question publishes as its
 * own on-chain election, so one process can carry the whole
 * single/multi × plain/extended matrix at once.
 *
 * The non-weighted single-choice-plain corner is already covered by
 * `csp-2fa-voting.e2e.ts`, so this spec takes the rest in one weighted
 * process: single+extended, multi+plain and multi+extended questions, voted in
 * one batch by a member whose voting power is 7. The weight is asserted at
 * both ends — the voter sees it before voting, and the public results tally 7
 * (not 1) per selected choice — which also proves the memberbase weight column
 * actually reached the census.
 */
test.describe('weighted voting across the question matrix', () => {
  test('a weighted member votes single/multi choice, plain and extended questions in one process', async ({
    page,
    browser,
  }) => {
    // Signup + import + 3-election publish + batched 3-envelope vote is the
    // longest journey in the suite; the config's default 5 minutes is sized for
    // single-election flows.
    test.setTimeout(10 * 60_000)

    const seed = String(Date.now()).slice(-6)
    // Distinct weights so a tally of 7 can only mean "the first member's
    // weight", never a coincidental sum of the others (3 + 1, or 1 + 1 + 1).
    const members = makeMembers(3, seed, [7, 3, 1])
    const organizationName = `Weighted Org ${seed}`

    // --- organizer -------------------------------------------------------
    await signUpWithOrganization(page, organizationName)
    await importMembers(page, members)

    const processId = await createAndPublishTwoFactorProcess(page, {
      title: `E2E matrix ${seed}`,
      weighted: true,
      // Choice labels are unique across questions on purpose: the results
      // assertions below locate tally rows by them.
      questions: [
        {
          title: 'Board renewal',
          extendedInfo: true,
          choices: [
            { label: 'Approve renewal', description: 'Extends the board mandate for two more years' },
            { label: 'Reject renewal', description: 'Opens a new election for every seat' },
          ],
        },
        {
          title: 'Committee members',
          type: 'multiple',
          choices: [{ label: 'Alice Example' }, { label: 'Bob Example' }],
        },
        {
          title: 'Budget projects',
          type: 'multiple',
          extendedInfo: true,
          choices: [
            { label: 'New park', description: 'Green area next to the river' },
            { label: 'New library', description: 'Extension of the current building' },
          ],
        },
      ],
    })
    expect(processId).toBeTruthy()

    // --- voter -----------------------------------------------------------
    const voterContext = await browser.newContext()
    await prepareContext(voterContext)
    const voter = await voterContext.newPage()

    try {
      const [member] = members // weight 7

      await voter.goto(`/processes/${processId}`)
      await expect(voter.getByRole('heading', { name: `E2E matrix ${seed}` }).first()).toBeVisible()

      await authenticateVoterWithOtp(voter, member)

      // Extended info made it through publish: the per-choice descriptions the
      // wizard stored as metadata render on the ballot (readable once identified).
      await voterScreen(voter, 'welcome').locator('[data-scope="action-bar"] button').first().click()
      await expect(voter.getByText('Extends the board mandate for two more years')).toBeVisible()

      // One ballot across all three questions — a single-choice pick, a
      // full multi-choice selection, and a partial one — relayed as one batch.
      await fillBallot(voter, [
        { question: 0, type: 'single', choices: [1] }, // Reject renewal
        { question: 1, type: 'multiple', choices: [0, 1] }, // Alice + Bob
        { question: 2, type: 'multiple', choices: [0] }, // New park
      ])

      // The census weight reached the voter session: the review's first row is the member's vote weight.
      await expect(voterScreen(voter, 'review')).toContainText(/Your vote counts 7/)

      await submitBallot(voter)
    } finally {
      await voterContext.close()
    }

    // --- observer --------------------------------------------------------
    // A fresh anonymous context (a voter's CSP session does not survive a
    // reload): the ballots really reached the chain if the public page reports
    // them — and reports them *weighted*.
    const observerContext = await browser.newContext()
    await prepareContext(observerContext)
    try {
      const observer = await observerContext.newPage()
      await observer.goto(`/processes/${processId}`)

      // One ballot was cast (the count is ballots, not weight)...
      await expect(await openPublicCount(observer)).toContainText(/^1\b/, { timeout: 120_000 })

      // ...but every selected choice tallies the voter's weight of 7. This is
      // the weighted-census assertion: a non-weighted census would read 1.
      const results = voterScreen(observer, 'results')

      // The innermost div holding the choice label is its tally row (ancestors
      // match `hasText` too, so `.last()` — document order puts the deepest
      // match at the end).
      const tallyRow = (choice: string) => results.locator('div').filter({ hasText: choice }).last()

      await expect(tallyRow('Reject renewal')).toContainText('7 votes')
      await expect(tallyRow('Approve renewal')).toContainText('0 votes')
      await expect(tallyRow('Alice Example')).toContainText('7 votes')
      await expect(tallyRow('Bob Example')).toContainText('7 votes')
      await expect(tallyRow('New park')).toContainText('7 votes')
      await expect(tallyRow('New library')).toContainText('0 votes')
    } finally {
      await observerContext.close()
    }
  })
})
