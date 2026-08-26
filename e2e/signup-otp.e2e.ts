import { TEST_PASSWORD, uniqueEmail } from './helpers/data'
import { createOrganization } from './helpers/flows'
import { checkCheckbox, expect, fillPinInput, test } from './helpers/fixtures'
import { extractCode, extractLink, MailSubjects, waitForCode, waitForEmail } from './helpers/mailhog'

/**
 * Same length and shape as the input, guaranteed to differ: advances the first
 * character to the next one in its own class (digit → digit, letter → letter),
 * so the result stays a plausible code the form will accept and submit.
 */
const rotateFirstCharacter = (code: string): string => {
  const [first, ...rest] = code
  const next = /[0-9]/.test(first)
    ? String((Number(first) + 1) % 10)
    : String.fromCharCode(first === 'z' ? 'a'.charCodeAt(0) : first.charCodeAt(0) + 1)
  return [next, ...rest].join('')
}

/**
 * Flow 1 — signup with an emailed OTP.
 *
 * The registration path is written out here rather than delegated to
 * `registerAndVerify`, because the email mechanics *are* the subject: this spec
 * asserts what the mail contains, not just that the journey completes. The
 * helper (used by the voting spec) is the same steps without the assertions.
 */
test.describe('signup with email verification', () => {
  test('registers, verifies with the emailed code and reaches the dashboard', async ({ page }) => {
    const email = uniqueEmail('signup')

    await page.goto('/account/signup')
    await expect(page.locator('input[name="firstName"]')).toBeVisible()

    await page.fill('input[name="firstName"]', 'Ada')
    await page.fill('input[name="lastName"]', 'Lovelace')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', TEST_PASSWORD)
    await checkCheckbox(page.locator('fieldset').filter({ has: page.locator('input[name="terms"]') }))

    const submittedAt = new Date()
    await page.locator('form button[type="submit"]').click()

    // Registering routes to the verification step, carrying the address along.
    await page.waitForURL(/\/account\/verify/)
    expect(decodeURIComponent(page.url())).toContain(email)

    const mail = await waitForEmail({
      to: email,
      subject: MailSubjects.accountVerification,
      since: submittedAt,
    })

    // The mail must carry a usable code AND a link back to this app — the link
    // is built from the backend's VOCDONI_WEBURL, so a misconfigured stack (or
    // a renamed route) shows up here rather than as a mystery 404 for a user.
    const code = extractCode(mail)
    expect(code).toMatch(/^[A-Za-z0-9]{6}$/)
    expect(extractLink(mail)).toContain('/account/verify')

    await fillPinInput(page.locator('body'), code)

    // Verification succeeded: the app moves the now-authenticated user on to
    // the organization step, which is only reachable with a session.
    await page.waitForURL(/\/account\/create-organization/)

    await createOrganization(page, `Signup Org ${Date.now()}`)
    await expect(page).toHaveURL(/\/admin/)
  })

  test('rejects a wrong verification code', async ({ page }) => {
    const email = uniqueEmail('signup-badcode')

    await page.goto('/account/signup')
    await page.fill('input[name="firstName"]', 'Ada')
    await page.fill('input[name="lastName"]', 'Lovelace')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', TEST_PASSWORD)
    await checkCheckbox(page.locator('fieldset').filter({ has: page.locator('input[name="terms"]') }))

    const submittedAt = new Date()
    await page.locator('form button[type="submit"]').click()
    await page.waitForURL(/\/account\/verify/)

    // Derive the wrong code from the real one rather than hard-coding a string
    // like 'zzzzzz'. Today's codes are 6 hex characters, so a non-hex string
    // could never collide — but that is an unpublished backend detail
    // (util.RandomHex(3)), and this stays correct if the alphabet ever widens.
    const realCode = await waitForCode({
      to: email,
      subject: MailSubjects.accountVerification,
      since: submittedAt,
    })
    const wrongCode = rotateFirstCharacter(realCode)
    expect(wrongCode).not.toBe(realCode)

    await fillPinInput(page.locator('body'), wrongCode)

    // The negative case matters as much as the happy one: without it, a verify
    // endpoint that accepted anything would still pass the test above.
    await expect(page.getByText(/incorrect|invalid/i).first()).toBeVisible({ timeout: 30_000 })
    await expect(page).toHaveURL(/\/account\/verify/)
  })
})
