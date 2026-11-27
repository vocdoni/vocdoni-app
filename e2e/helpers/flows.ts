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
const registerAndVerify = async (page: Page, prefix = 'organizer'): Promise<RegisteredUser> => {
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

  // Spain infers Spanish, and org-scoped emails follow the org's language rather than
  // the request's, so pin English to keep the MailSubjects assertions valid. The submit
  // button gates on the language query; a backend without that endpoint shows an alert.
  const submit = page.locator('form button[type="submit"]')
  await expect(submit).toBeEnabled()
  const languageField = page.locator('#defaultLang')
  if (await languageField.count()) {
    await selectComboboxOption(page, languageField, 'English')
  }

  await submit.click()

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
  // own header names. `weight` (the voting power a weighted process reads) only
  // exists when the members carry one, matching what `membersCsv` emitted.
  const columns = ['name', 'surname', 'email', 'memberNumber']
  if (members.some((member) => member.weight !== undefined)) columns.push('weight')
  if (members.some((member) => member.password !== undefined)) columns.push('password')
  for (const column of columns) {
    await selectComboboxOption(page, page.locator(`#${column}`), column)
  }

  // `type=submit form=import-members` — targeting the form association avoids
  // matching on the button's translated label.
  await page.locator('button[form="import-members"]').click()

  const [first] = members
  await expect(page.getByText(first.email, { exact: false })).toBeVisible({ timeout: 120_000 })
}

/**
 * Narrower than Chakra's `md` breakpoint — the same question the components
 * ask. Read from the viewport, not the project name, so adding or renaming a
 * device project cannot break it.
 */
const isMobileViewport = (page: Page): boolean => (page.viewportSize()?.width ?? Number.POSITIVE_INFINITY) < 768

/**
 * The wizard's Settings panel, identified by a field only it contains.
 *
 * Assert open/closed here, never on a field inside it: react-select forces
 * `visibility: visible` on its own input, so every combobox in the panel still
 * reports as visible while it is shut.
 */
const wizardSettings = (page: Page): Locator => page.locator('aside').filter({ has: page.locator('#resultVisibility') })

/**
 * Opens the Settings panel when it is a drawer. No-op at `md` and up, where it
 * is a docked sidebar that is always open.
 */
const openWizardSettings = async (page: Page): Promise<void> => {
  if (!isMobileViewport(page)) return

  await page.getByTestId('wizard-settings-toggle').click()
  await expect(wizardSettings(page)).toBeVisible()
}

/** Closes it again: open, the drawer covers the top bar, Publish included. */
const closeWizardSettings = async (page: Page): Promise<void> => {
  if (!isMobileViewport(page)) return

  await page.getByTestId('wizard-settings-close').click()
  await expect(wizardSettings(page)).toBeHidden()
}

export type ChoiceSpec = {
  label: string
  /** Filled through the extended-info editor; requires `extendedInfo` on the question. */
  description?: string
}

/**
 * One wizard question. Type and presentation are per-question settings — every
 * question is published as its own on-chain election, which is exactly what
 * lets one process cover the whole single/multi × plain/extended matrix.
 */
export type QuestionSpec = {
  title: string
  /** The wizard default is single choice. */
  type?: 'single' | 'multiple'
  /** Switches the question to extended choice cards (per-choice description/image). */
  extendedInfo?: boolean
  /** Exactly two: the wizard starts every question with two empty options. */
  choices: [ChoiceSpec, ChoiceSpec]
}

export type ProcessSpec = {
  title: string
  questions: QuestionSpec[]
  /** Weighted by the memberbase voting-power column ("One person, one vote" otherwise). */
  weighted?: boolean
  /** Blind-CSP census: the CSP signs a ballot it cannot read. Defaults to off. */
  anonymous?: boolean
  /** The credentials voters identify with, as checkbox values (API field names). Defaults to `memberNumber`. */
  credentials?: string[]
  /** Email 2FA on top of the credentials. Defaults to on. */
  twoFactor?: boolean
  /**
   * Closing time, in minutes from now (the pickers have minute resolution, so it ends within the minute after).
   * Unset, the wizard's end fields stay as they are.
   */
  endsInMinutes?: number
  /**
   * The create form's "Open the questions yourself" switch: the questions start paused and the organiser opens them
   * from the vote's page. The switch is hidden only when the app runs with
   * QUESTION_BY_QUESTION=false.
   */
  startPaused?: boolean
  /**
   * "Show the results to voters": the voting page offers the live count and the results. Off by default, as in the
   * wizard, so a spec that reads results turns it on.
   */
  voterResults?: boolean
}

/**
 * Fills one question card of the create wizard. Field names come from
 * react-hook-form (`questions.N....`), so nothing here depends on translated
 * copy except the question-type option labels, which the Select renders from
 * i18n defaults.
 */
const fillQuestion = async (page: Page, index: number, question: QuestionSpec): Promise<void> => {
  await page.fill(`input[name="questions.${index}.title"]`, question.title)

  if (question.type === 'multiple') {
    // One type Select per question, in question order. It has no stable id —
    // only its aria-label, which chakra-react-select puts on the focusable
    // input.
    await selectComboboxOption(page, page.getByLabel('Question type').nth(index), /Multiple choice/i)
  }

  if (question.extendedInfo) {
    // Switch.Root's `id` prop becomes the zag machine id, and the DOM root
    // renders as `switch:<id>` — hence the attribute selector instead of `#`.
    const extendedSwitch = page.locator(`[id="switch:extended-info-${index}"]`)
    await toggleSwitch(extendedSwitch)
  }

  for (const [optionIndex, choice] of question.choices.entries()) {
    const optionInput = page.locator(`input[name="questions.${index}.options.${optionIndex}.option"]`)
    await optionInput.fill(choice.label)

    if (choice.description) {
      // The per-choice description is a Lexical editor (a contenteditable), not
      // an input, and only exists on extended cards. Scope it through the card
      // that holds this option's title input.
      const card = page.locator('[data-choice-card]').filter({ has: optionInput })
      await card.locator('[contenteditable="true"]').fill(choice.description)
    }
  }
}

/**
 * Fills the create wizard up to its Settings panel, stopping before Publish, so
 * the caller can publish or assert on what Publish does. `twoFactor` (on by
 * default) adds the emailed OTP to the memberNumber census.
 */
export const fillProcessWizard = async (page: Page, spec: ProcessSpec): Promise<void> => {
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

  if (spec.startPaused) {
    // Same switch shape as the voter-results one below: the hidden input carries the form field name.
    const startPaused = page.locator('input[name="startPaused"]')
    await toggleSwitch(page.locator('[data-scope="switch"]').filter({ has: startPaused }))
    await expect(startPaused).toBeChecked()
  }

  for (const [index, question] of spec.questions.entries()) {
    // The restored draft holds one default question; the rest are appended.
    if (index > 0) {
      await page.getByRole('button', { name: /Add question/i }).click()
      await expect(page.locator(`input[name="questions.${index}.title"]`)).toBeVisible()
    }
    await fillQuestion(page, index, question)
  }

  // Guard the draft race above: if it ever changes shape, fail here with an
  // obvious message instead of at the publish step's validation errors.
  await expect(page.locator('input[name="questions.0.title"]')).toHaveValue(spec.questions[0].title)

  // Everything up to the publish click lives in the Settings panel.
  await openWizardSettings(page)

  // Live results, not the "hidden until the end" default: a secret process
  // seals ballots with per-question encryption keys the keykeepers only publish
  // after publication, which is a different feature with its own timing. This
  // suite is about the email/OTP journey, so keep the ballot path plain.
  await selectComboboxOption(page, page.locator('#resultVisibility'), /Live results/i)

  if (spec.voterResults) {
    // Same switch shape as the anonymous one below: the hidden input carries the form field name.
    const showResults = page.locator('input[name="showVoterResults"]')
    await toggleSwitch(page.locator('[data-scope="switch"]').filter({ has: showResults }))
    await expect(showResults).toBeChecked()
  }

  if (spec.endsInMinutes !== undefined) {
    // Formatted in the browser so the picker sees its own time zone, whatever the runner's.
    const { date, time } = await page.evaluate((minutes) => {
      const end = new Date(Date.now() + minutes * 60_000 + 60_000)
      const two = (n: number) => String(n).padStart(2, '0')
      return {
        date: `${end.getFullYear()}-${two(end.getMonth() + 1)}-${two(end.getDate())}`,
        time: `${two(end.getHours())}:${two(end.getMinutes())}`,
      }
    }, spec.endsInMinutes)
    await page.locator('input[name="endDate"]').fill(date)
    await page.locator('input[name="endTime"]').fill(time)
  }

  if (spec.weighted) {
    // Votes weighted by the memberbase voting-power column — the members must
    // have been imported with weights or the census validation below rejects.
    await selectComboboxOption(page, page.locator('#weightedVote'), /Weighted by voting power/i)
  }

  if (spec.anonymous) {
    // The switch's hidden input carries the form field name, so this does not
    // depend on the translated label. Clicking the visible control, as a user
    // would, is what flips it — the input itself is hidden.
    const anonymous = page.locator('input[name="anonymousVoting"]')
    await toggleSwitch(page.locator('[data-scope="switch"]').filter({ has: anonymous }))
    await expect(anonymous).toBeChecked()
  }

  // The census is the group; voter authentication cannot be configured until
  // one is chosen (the modal button reports as much).
  await selectComboboxOption(page, page.locator('#groupId'), /All Members/i)

  await page.getByRole('button', { name: /Configure Voter Authentication/i }).click()
  const dialog = page.getByRole('dialog')

  // What voters type. The checkbox card `value` is the API field name, so this
  // does not depend on the translated label.
  for (const credential of spec.credentials ?? ['memberNumber']) {
    await checkCheckbox(
      dialog
        .locator('[data-scope="checkbox"][data-part="root"]')
        .filter({ has: page.locator(`input[value="${credential}"]`) })
    )
    await expect(dialog.locator(`input[value="${credential}"]`)).toBeChecked()
  }

  // The one-time code, a radio card group whose item values are the method
  // names ('none' | 'email' | 'sms' | 'voter_choice'). It starts on 'none'.
  if (spec.twoFactor ?? true) {
    await dialog
      .locator('[data-scope="radio-group"][data-part="item"]')
      .filter({ has: page.locator('input[value="email"]') })
      .click()
    await expect(dialog.locator('input[value="email"]')).toBeChecked()
  }

  // Saving runs the backend census validation (the chosen credentials must be
  // unique and complete across the group) before closing.
  await dialog.getByTestId('voter-auth-save').click()
  await expect(dialog).toBeHidden({ timeout: 60_000 })

  await closeWizardSettings(page)
}

/**
 * Creates and publishes a process whose census authenticates voters by
 * `memberNumber` and challenges them with an emailed OTP — the configuration
 * the CSP 2FA voting flow exists to exercise.
 *
 * Returns the published process id, read off the URL the wizard redirects to.
 */
export const createAndPublishTwoFactorProcess = async (page: Page, spec: ProcessSpec): Promise<string> => {
  await fillProcessWizard(page, spec)

  await page.getByRole('button', { name: /^Publish$/ }).click()

  // Publish saves the draft and opens the review dialog. Its primary is the
  // `data-primary` button, enabled once the price is read: "publish" for the
  // stack's small, free census.
  const review = page.getByRole('dialog')
  const reviewPrimary = review.locator('[data-primary]')
  await expect(reviewPrimary).toBeEnabled({ timeout: 60_000 })
  await reviewPrimary.click()

  // Publishing creates the on-chain elections, so this is the slowest step in
  // the suite by a wide margin.
  const published = page.waitForURL(/\/admin\/process\/[^/]+$/, { timeout: 180_000 })
  // A vote the organization's balance pays for asks once more, on its wallet step
  const walletPrimary = review.locator('[data-primary=pay-from-balance]')
  const walletStep = walletPrimary.waitFor({ state: 'visible', timeout: 180_000 }).then(
    () => true,
    () => false
  )
  if (await Promise.race([published.then(() => false), walletStep])) await walletPrimary.click()
  await published

  const processId = page.url().split('/').pop()
  if (!processId) throw new Error(`Could not read the process id from ${page.url()}`)
  return processId
}

/** The voter page's screen on display (`data-testid="voter-screen"` with `data-screen="<kind>"`). */
export const voterScreen = (page: Page, kind?: string): Locator =>
  page.locator(kind ? `[data-testid="voter-screen"][data-screen="${kind}"]` : '[data-testid="voter-screen"]')

/**
 * The identify screen of the public process page, once React owns it.
 *
 * `/processes/:id` is server-rendered, so the form exists before hydration; its submit button stays disabled until
 * then (a native submit would put the voter's details in the URL). Waiting for it enabled turns that window into a
 * wait instead of a lost click.
 */
export const openIdentifyModal = async (page: Page): Promise<Locator> => {
  const screen = voterScreen(page, 'identify')
  await expect(screen).toBeVisible({ timeout: 60_000 })
  await expect(screen.locator('button[type="submit"]')).toBeEnabled({ timeout: 60_000 })
  return screen
}

/**
 * Waits until React owns a server-rendered element. Until hydration a button is inert, so a click that lands before
 * it does nothing. React stamps its props on each host node it hydrates (`__reactProps$…`): that is what is awaited.
 */
export const waitForHydration = async (locator: Locator, timeout = 60_000): Promise<void> => {
  await expect(locator).toBeVisible({ timeout })
  await expect
    .poll(() => locator.evaluate((node) => Object.keys(node).some((key) => key.startsWith('__reactProps$'))), {
      timeout,
    })
    .toBe(true)
}

/**
 * Authenticates a voter against a 2FA census: identify (credentials + contact) → read the emailed OTP → the code
 * screen. Leaves the voter on the welcome screen (or `landing`), ready to vote.
 */
export const authenticateVoterWithOtp = async (
  page: Page,
  member: TestMember,
  landing = 'welcome'
): Promise<string> => {
  const screen = await openIdentifyModal(page)

  await screen.locator('input[name="memberNumber"]').fill(member.memberNumber)
  // One field for both channels: the form routes it to `email` or `phone`
  // depending on the census's twoFaFields (email only, here).
  await screen.locator('input[name="contact"]').fill(member.email)
  // Terms acceptance: required, and until it is ticked the page refuses to continue with its own message (the form is
  // `noValidate`, so the browser does not block it).
  await checkCheckbox(screen)

  const requestedAt = new Date()
  await screen.locator('button[type="submit"]').click()

  const otp = await waitForCode({
    to: member.email,
    subject: MailSubjects.twoFactorChallenge,
    since: requestedAt,
  })

  // No submit click: the code boxes submit themselves the moment the sixth digit lands. Clicking as well races the
  // in-flight request.
  await fillPinInput(voterScreen(page, 'code'), otp)

  // Identified: the page moves to the welcome screen once the membership check answers (`landing` names another
  // screen for the flows that identify to check a vote, which lands on `alreadyVoted`).
  await expect(voterScreen(page, landing)).toBeVisible({ timeout: 60_000 })

  return otp
}

/**
 * Submits the identify screen on an auth-only census of `memberNumber` + `password`: fills both, accepts the terms
 * and submits. The caller asserts the outcome (the welcome screen on success, an error on the identify screen
 * otherwise), and may call it again on the same screen to retry.
 */
export const submitPasswordLogin = async (screen: Locator, memberNumber: string, password: string): Promise<void> => {
  await screen.locator('input[name="memberNumber"]').fill(memberNumber)
  await screen.locator('input[name="password"]').fill(password)
  // The terms checkbox keeps its state between attempts on the same screen.
  const terms = screen.locator('[data-scope="checkbox"][data-part="root"] input[type="checkbox"]').first()
  if (!(await terms.isChecked())) await checkCheckbox(screen)
  await screen.locator('button[type="submit"]').click()
}

/**
 * One question's selections on the voting form. `choices` holds ballot values
 * ("0", "1", … as rendered on the inputs), so nothing depends on option labels.
 */
export type BallotSelection = {
  /** Question position in the form — matches the wizard's question order. */
  question: number
  /** Must match the published question type: it decides radio vs checkbox. */
  type: 'single' | 'multiple'
  choices: number[]
}

/**
 * Answers the ballot one question per screen, from the welcome screen (or a question already on screen) to review.
 *
 * Single-choice questions render hidden radios carrying the ballot value, so they need `check({ force })` (the
 * visible card intercepts the click). Multiple-choice questions render Chakra checkboxes whose parts carry
 * deterministic ids (`question-<q>-choice-<value>-control`): the visible control is the click target. "Continua"
 * (`voter-continue`) moves to the next question, and after the last one to review.
 */
export const fillBallot = async (page: Page, selections: BallotSelection[]): Promise<void> => {
  const welcome = voterScreen(page, 'welcome')
  if (await welcome.isVisible()) await welcome.locator('[data-scope="action-bar"] [data-part="primary"] button').click()
  for (const selection of [...selections].sort((a, b) => a.question - b.question)) {
    const question = voterScreen(page, 'question')
    // The fields stay disabled until the SDK reports the voter able to vote, which can land after identification.
    await expect(question.locator('input:is([type="radio"], [type="checkbox"])').first()).toBeEnabled({
      timeout: 60_000,
    })
    for (const value of selection.choices) {
      if (selection.type === 'single') {
        await question.locator(`input[type="radio"][value="${value}"]`).check({ force: true })
      } else {
        await question.locator(`[id="question-${selection.question}-choice-${value}-control"]`).click()
      }
    }
    await page.getByTestId('voter-continue').click()
  }
  await expect(voterScreen(page, 'review')).toBeVisible({ timeout: 30_000 })
}

/**
 * Casts the reviewed ballot and waits for the whole batch to be recorded.
 *
 * The review screen is the confirmation: "Emet el vot" (`voter-cast`) casts with no dialog (the button arms a
 * moment after the screen appears; the click waits for it). Waits for the
 * receipt (`vote-receipt`), not for the sending screen to go: the receipt renders only once every question of the
 * process is on chain, so this is also the multi-question completion check.
 */
export const submitBallot = async (page: Page): Promise<void> => {
  await page.getByTestId('voter-cast').click()
  await expect(page.getByTestId('vote-receipt')).toBeVisible({ timeout: 180_000 })
}

/**
 * Casts a vote for the choice at `choiceIndex` on the (single) question and
 * waits for the process to record it.
 */
export const castVote = async (page: Page, choiceIndex: number): Promise<void> => {
  await fillBallot(page, [{ question: 0, type: 'single', choices: [choiceIndex] }])
  await submitBallot(page)
}

/**
 * The live count a visitor reads: from the identify screen, "Mostra els resultats" (`voter-show-results`), then the
 * results view's count (`process-vote-count`).
 */
export const openPublicCount = async (page: Page): Promise<Locator> => {
  await openIdentifyModal(page)
  await page.getByTestId('voter-show-results').click()
  await expect(voterScreen(page, 'results')).toBeVisible()
  return page.getByTestId('process-vote-count')
}

/**
 * Authenticates a voter on an auth-only census (credentials, no one-time code): fills the member number, accepts the
 * terms and submits. Leaves the voter on `landing` (a question-by-question vote lands on a `room*` screen).
 */
export const identifyWithMemberNumber = async (page: Page, member: TestMember, landing: string): Promise<void> => {
  const screen = await openIdentifyModal(page)
  await screen.locator('input[name="memberNumber"]').fill(member.memberNumber)
  await checkCheckbox(screen)
  await screen.locator('button[type="submit"]').click()
  await expect(voterScreen(page, landing)).toBeVisible({ timeout: 60_000 })
}

/** The organiser's vote page ("Manage" is the process route itself); stays put when already there. */
const openVotePage = async (page: Page, processId: string): Promise<void> => {
  if (!page.url().endsWith(`/admin/process/${processId}`)) await page.goto(`/admin/process/${processId}`)
}

/**
 * A question's own controls on the organiser's vote page. The buttons are named "<Action>: question <n>, <title>"
 * (English), so the number picks the row; a phone also draws the active question's buttons in a bottom bar, hence
 * `first()`.
 */
const questionButton = (page: Page, action: 'Open' | 'Close', index: number): Locator =>
  page.getByRole('button', { name: new RegExp(`^${action}: question ${index + 1},`) }).first()

/** On the organiser's vote page, opens question `index` (0-based) from its controls and waits for it to read open. */
export const openQuestion = async (page: Page, processId: string, index: number): Promise<void> => {
  await openVotePage(page, processId)
  const open = questionButton(page, 'Open', index)
  await expect(open).toBeEnabled({ timeout: 60_000 })
  await open.click()
  // An open question's row offers Close; a waiting one does not.
  await expect(questionButton(page, 'Close', index)).toBeVisible({ timeout: 120_000 })
}

/** Closes question `index` (confirming the dialog) and waits for it to read closed. */
export const closeQuestion = async (page: Page, processId: string, index: number): Promise<void> => {
  await openVotePage(page, processId)
  const close = questionButton(page, 'Close', index)
  await expect(close).toBeEnabled({ timeout: 60_000 })
  await close.click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: `Close question ${index + 1}`, exact: true }).click()
  await expect(dialog).toBeHidden({ timeout: 120_000 })
  // A closed question's row has no Close button any more.
  await expect(questionButton(page, 'Close', index)).toBeHidden({ timeout: 120_000 })
}

/**
 * Ends the vote from the header ("End now", confirmed in its dialog) and waits for the header to drop its actions.
 * Closing the last question of a question-by-question vote already ends it, and then there is nothing to click: the
 * call returns.
 */
export const endVote = async (page: Page, processId: string): Promise<void> => {
  await openVotePage(page, processId)
  const end = page.getByRole('button', { name: /^End now$/ })
  const offered = await end.waitFor({ state: 'visible', timeout: 10_000 }).then(
    () => true,
    () => false
  )
  if (!offered) return
  await end.click()
  const dialog = page.getByRole('dialog')
  // The dialog's confirm reads "End now" (all at once) or "End the vote" (question by question).
  await dialog.getByRole('button', { name: /^(End now|End the vote)$/ }).click()
  await expect(dialog).toBeHidden({ timeout: 120_000 })
  await expect(end).toBeHidden({ timeout: 120_000 })
}

/** Pauses the vote from the header and waits for "Resume" to take its place. */
export const pauseVote = async (page: Page, processId: string): Promise<void> => {
  await openVotePage(page, processId)
  await page.getByRole('button', { name: /^Pause$/ }).click()
  await expect(page.getByRole('button', { name: /^Resume$/ })).toBeVisible({ timeout: 120_000 })
}

/** Resumes a paused vote from the header and waits for "Pause" to take its place. */
export const resumeVote = async (page: Page, processId: string): Promise<void> => {
  await openVotePage(page, processId)
  await page.getByRole('button', { name: /^Resume$/ }).click()
  await expect(page.getByRole('button', { name: /^Pause$/ })).toBeVisible({ timeout: 120_000 })
}

/**
 * Picks `value` on the open question's ballot (frame 2) and casts it; waits for frame 3. Single choice only: the
 * ballot value is on the hidden radio, like `fillBallot`. "Emet el vot" arms a moment after the screen appears and the
 * click waits for it.
 */
export const castOpenQuestion = async (page: Page, value: number): Promise<void> => {
  const question = voterScreen(page, 'roomQuestion')
  // The fields stay disabled until the SDK reports the voter able to vote, which can land after the screen shows.
  await expect(question.locator('input[type="radio"]').first()).toBeEnabled({ timeout: 60_000 })
  await question.locator(`input[type="radio"][value="${value}"]`).check({ force: true })
  await page.getByTestId('voter-cast').click()
  await expect(voterScreen(page, 'roomVoted')).toBeVisible({ timeout: 180_000 })
}

/** The receipt codes (the vote ids in the Explorer links) shown in `screen`, sorted. */
export const receiptCodes = async (screen: Locator): Promise<string[]> => {
  const links = screen.locator('a[href*="/verify/"]')
  await expect(links.first()).toBeVisible()
  const hrefs = await links.evaluateAll((anchors) => anchors.map((anchor) => (anchor as HTMLAnchorElement).href))
  return hrefs.map((href) => href.split('/verify/')[1]).sort()
}
