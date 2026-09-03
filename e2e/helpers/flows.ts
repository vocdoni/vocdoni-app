import { expect, type Locator, type Page } from '@playwright/test'
import { membersCsv, TEST_PASSWORD, type TestMember, uniqueEmail } from './data'
import { checkCheckbox, fillPinInput, selectComboboxOption, toggleSwitch } from './fixtures'
import { MailSubjects, waitForCode } from './mailhog'

/**
 * Reusable page drivers for the parts of the journey more than one spec needs.
 *
 * Everything here goes through the real UI on purpose — nothing is provisioned
 * behind the app's back — so the CSP voting spec exercises the signup path as a
 * side effect of getting to a published process.
 *
 * A note on URLs: public routes are language-prefixed by the SSR server
 * (`/account/signup` → `/en/account/signup`), so every URL assertion below
 * matches on a path fragment rather than an absolute path.
 */

export type RegisteredUser = {
  email: string
  password: string
}

/**
 * Signs a new user up and verifies them with the code emailed to MailHog.
 * Leaves the browser on the organization-creation step, authenticated.
 */
export const registerAndVerify = async (page: Page, prefix = 'organizer'): Promise<RegisteredUser> => {
  const email = uniqueEmail(prefix)

  await page.goto('/account/signup')
  await expect(page.locator('input[name="firstName"]')).toBeVisible()

  await page.fill('input[name="firstName"]', 'E2E')
  await page.fill('input[name="lastName"]', 'Runner')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', TEST_PASSWORD)
  await checkCheckbox(page.locator('fieldset').filter({ has: page.locator('input[name="terms"]') }))

  // Taken before the click so `waitForCode` cannot settle for a stale mail.
  const submittedAt = new Date()
  await page.locator('form button[type="submit"]').click()

  await page.waitForURL(/\/account\/verify/)

  const code = await waitForCode({ to: email, subject: MailSubjects.accountVerification, since: submittedAt })
  // The verify form submits itself once all six boxes hold a character.
  await fillPinInput(page.locator('body'), code)

  await page.waitForURL(/\/account\/create-organization/)

  return { email, password: TEST_PASSWORD }
}

/**
 * Fills the organization-creation step and lands in the dashboard. `size`,
 * `type` and `country` are comboboxes, not `<select>`s — see
 * `selectComboboxOption`.
 */
export const createOrganization = async (page: Page, name: string): Promise<void> => {
  await expect(page.locator('input[name="name"]')).toBeVisible()
  await page.fill('input[name="name"]', name)

  await selectComboboxOption(page, page.locator('#size'), '0-100')
  // Whatever the backend's first organization type happens to be: the list is
  // served by the API, so hard-coding a label would couple the suite to its data.
  await page.locator('#type').click()
  await page.getByRole('option').first().click()
  await selectComboboxOption(page, page.locator('#country'), /Spain/)

  await page.locator('form button[type="submit"]').click()

  // Provisioning the on-chain account happens server-side during this request.
  await page.waitForURL(/\/admin/, { timeout: 120_000 })
}

/** Signup → verify → organization, the common prelude to any organizer flow. */
export const signUpWithOrganization = async (page: Page, organizationName: string): Promise<RegisteredUser> => {
  const user = await registerAndVerify(page)
  await createOrganization(page, organizationName)
  return user
}

/**
 * Imports members through the CSV drawer: upload → map every column → submit →
 * wait until the members table actually lists them.
 *
 * The completion check is the members table, not the progress banner: the
 * banner is an intermediate signal, whereas "the members are in the memberbase"
 * is the outcome the rest of the journey depends on (the census is built from
 * it). The import runs as a background job, hence the generous expect timeout.
 */
export const importMembers = async (page: Page, members: TestMember[]): Promise<void> => {
  await page.goto('/admin/memberbase/members')
  await page.getByTestId('members-import-open').click()

  const fileInput = page.locator('input[type="file"]').first()
  await expect(fileInput).toBeAttached()
  await fileInput.setInputFiles({
    name: 'members.csv',
    mimeType: 'text/csv',
    buffer: membersCsv(members),
  })

  // The mapper starts empty — nothing is auto-detected — so every column the
  // census will need must be mapped explicitly. The option labels are the CSV's
  // own header names.
  for (const column of ['name', 'surname', 'email', 'memberNumber']) {
    await selectComboboxOption(page, page.locator(`#${column}`), column)
  }

  // `type=submit form=import-members` — targeting the form association avoids
  // matching on the button's translated label.
  await page.locator('button[form="import-members"]').click()

  const [first] = members
  await expect(page.getByText(first.email, { exact: false })).toBeVisible({ timeout: 120_000 })
}

export type ProcessSpec = {
  title: string
  question: string
  choices: [string, string]
}

/**
 * Creates and publishes a process whose census authenticates voters by
 * `memberNumber` and challenges them with an emailed OTP — the configuration
 * the CSP 2FA voting flow exists to exercise.
 *
 * Returns the published process id, read off the URL the wizard redirects to.
 */
export const createAndPublishTwoFactorProcess = async (page: Page, spec: ProcessSpec): Promise<string> => {
  await page.goto('/admin/processes/create')
  await expect(page.locator('input[name="title"]')).toBeVisible()

  // Settle the draft machinery BEFORE filling the form.
  //
  // The wizard auto-saves on every focusout. The first such save creates the
  // draft and stores its id, which switches on the draft *read* — and when that
  // read resolves, an effect writes the server's copy back over every field.
  // Anything typed between the save and the read landing is silently discarded
  // (observed: title survives, question and options come back blank).
  //
  // Typing only the title, letting the draft exist, then reloading sidesteps it
  // entirely: on the reload the draft id is known at mount, so the restore runs
  // once before any typing and cannot fire again (nothing invalidates the
  // draft query afterwards).
  await page.fill('input[name="title"]', spec.title)
  await page.locator('input[name="title"]').blur()
  await expect
    .poll(() => page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('draft-ids') ?? '{}')).length), {
      timeout: 60_000,
    })
    .toBeGreaterThan(0)

  await page.reload()
  await expect(page.locator('input[name="title"]')).toHaveValue(spec.title)

  await page.fill('input[name="questions.0.title"]', spec.question)
  await page.fill('input[name="questions.0.options.0.option"]', spec.choices[0])
  await page.fill('input[name="questions.0.options.1.option"]', spec.choices[1])

  // Guard the race above: if it ever changes shape, fail here with an obvious
  // message instead of at the publish step's validation errors.
  await expect(page.locator('input[name="questions.0.title"]')).toHaveValue(spec.question)

  // Live results, not the "hidden until the end" default: a secret process
  // seals ballots with per-question encryption keys the keykeepers only publish
  // after publication, which is a different feature with its own timing. This
  // suite is about the email/OTP journey, so keep the ballot path plain.
  await selectComboboxOption(page, page.locator('#resultVisibility'), /Live results/i)

  // The census is the group; voter authentication cannot be configured until
  // one is chosen (the modal button reports as much).
  await selectComboboxOption(page, page.locator('#groupId'), /All Members/i)

  await page.getByRole('button', { name: /Configure Voter Authentication/i }).click()
  const dialog = page.getByRole('dialog')

  // Tab 1 — credentials. The checkbox `value` is the API field name, so this
  // does not depend on the translated label.
  await checkCheckbox(
    dialog
      .locator('[data-scope="checkbox"][data-part="root"]')
      .filter({ has: page.locator('input[value="memberNumber"]') })
  )
  await expect(dialog.locator('input[value="memberNumber"]')).toBeChecked()

  // The tab triggers are disabled until their step is completed, so the modal
  // is advanced with its footer button — the same path a user takes. It is
  // "Next" on the first two steps and "Confirm" on the last.
  const advance = dialog.getByTestId('voter-auth-next')
  await advance.click()

  // Tab 2 — 2FA. `use2FAMethod` already defaults to 'email', so enabling the
  // switch is the whole configuration.
  await expect(dialog.locator('[data-scope="tabs"][data-part="trigger"][data-value="twoFactor"]')).toHaveAttribute(
    'data-selected',
    ''
  )
  await toggleSwitch(dialog)
  await expect(dialog.locator('input[value="email"]')).toBeChecked()
  await advance.click()

  // Tab 3 — summary. Confirming runs the backend census validation (the chosen
  // credentials must be unique and complete across the group) before closing.
  await advance.click()
  await expect(dialog).toBeHidden({ timeout: 60_000 })

  await page.getByRole('button', { name: /^Publish$/ }).click()

  // Publishing creates the on-chain elections, so this is the slowest step in
  // the suite by a wide margin.
  await page.waitForURL(/\/admin\/process\/[^/]+$/, { timeout: 180_000 })

  const processId = page.url().split('/').pop()
  if (!processId) throw new Error(`Could not read the process id from ${page.url()}`)
  return processId
}

/**
 * Opens the CSP authentication modal from the public process page.
 *
 * Retries the click until the dialog actually appears. `/processes/:id` is
 * server-rendered, so the "Identify" button exists in the SSR markup before
 * React has hydrated; a click landing in that window hits a real DOM node with
 * no handler attached, does nothing, and leaves the test waiting forever for a
 * modal that will never open.
 *
 * Precautionary rather than a fix for an observed failure — the suite has been
 * stable without it against a healthy stack. `toPass` costs nothing on the
 * common path where hydration already won, and turns the worst case into a
 * retry instead of a hang.
 */
export const openIdentifyModal = async (page: Page): Promise<Locator> => {
  const dialog = page.getByRole('dialog')

  await expect(async () => {
    // Two "Identify" triggers render (main column and aside); either opens the
    // same modal.
    await page.getByRole('button', { name: 'Identify' }).first().click()
    await expect(dialog).toBeVisible({ timeout: 5_000 })
  }).toPass({ timeout: 60_000 })

  return dialog
}

/**
 * Authenticates a voter against a 2FA census: CSP step 0 (credentials +
 * contact) → read the emailed OTP → CSP step 1.
 *
 * Leaves the voter connected on the process page, ready to vote.
 */
export const authenticateVoterWithOtp = async (page: Page, member: TestMember): Promise<string> => {
  const dialog = await openIdentifyModal(page)

  await dialog.locator('input[name="memberNumber"]').fill(member.memberNumber)
  // One field for both channels: the form routes it to `email` or `phone`
  // depending on the census's twoFaFields (email only, here).
  await dialog.locator('input[name="contact"]').fill(member.email)
  // Terms acceptance. It looks decorative — no react-hook-form registration —
  // but its Field.Root marks it required, which propagates to the hidden input
  // and makes the browser block submission until it is ticked.
  await checkCheckbox(dialog)

  const requestedAt = new Date()
  await dialog.locator('button[type="submit"]').click()

  const otp = await waitForCode({
    to: member.email,
    subject: MailSubjects.twoFactorChallenge,
    since: requestedAt,
  })

  // No submit click: the pin input submits itself the moment the sixth digit
  // lands (same as the account-verification form). Clicking as well races the
  // in-flight request and detaches the button mid-click.
  await fillPinInput(dialog, otp)

  // Auth done: the modal closes and the process page swaps the "Identify"
  // trigger for the voting UI.
  await expect(dialog).toBeHidden({ timeout: 60_000 })

  return otp
}

/**
 * Casts a vote for the choice at `choiceIndex` on the (single) question and
 * waits for the process to record it.
 *
 * The choice radios carry the ballot value as their `value` ("0", "1", …), so
 * the selection does not depend on the option's label. The confirm button does
 * — it is rendered by `@vocdoni/react-components`, outside this repo, so there
 * is no test-id to add to it.
 */
export const castVote = async (page: Page, choiceIndex: number): Promise<void> => {
  await page.locator(`input[type="radio"][value="${choiceIndex}"]`).check({ force: true })

  await page.getByRole('button', { name: /^Vote$/ }).click()

  const confirmation = page.getByRole('dialog')
  await confirmation.getByRole('button', { name: /confirm/i }).click()

  // Wait for the success modal, NOT for the Vote button to disappear: the
  // button goes as soon as submission starts, so that would pass while the vote
  // is still being relayed (and would keep passing if it then failed). The
  // modal renders only once the process reports the voter as having voted.
  await expect(page.getByTestId('vote-success-modal')).toBeVisible({ timeout: 180_000 })
}
