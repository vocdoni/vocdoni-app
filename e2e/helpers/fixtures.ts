import { type BrowserContext, type Locator, type Page, test as base } from '@playwright/test'

/**
 * Key and value read by src/components/Cookies/utils.ts. Seeding it means the
 * consent banner never renders.
 *
 * This is not cosmetic: the banner is a `role="dialog"` pinned over the page,
 * and Playwright refuses to click anything it covers ("intercepts pointer
 * events") — it blocks the signup form's terms checkbox outright. Dismissing it
 * by clicking would work too, but it would put a banner interaction at the top
 * of every journey and make an unrelated UI change able to break every spec.
 */
const COOKIE_CONSENT_KEY = 'vocdoni-cookie-consent'
const COOKIE_CONSENT_VALUE = 'rejected'

/**
 * Pre-seeds consent for every page in a context. Must be applied before the
 * first navigation, hence an init script rather than a plain localStorage write.
 *
 * Call this on any context made by hand (`browser.newContext()`, e.g. the voter
 * session in the CSP flow); the `test` export below already does it for the
 * default one.
 */
export const prepareContext = async (context: BrowserContext): Promise<void> => {
  await context.addInitScript(
    ([key, value]) => {
      try {
        window.localStorage.setItem(key, value)
      } catch {
        // Private-mode style failures are not worth failing a test over: the
        // banner reappearing is a visible symptom on its own.
      }
    },
    [COOKIE_CONSENT_KEY, COOKIE_CONSENT_VALUE]
  )
}

export const test = base.extend<{ context: BrowserContext }>({
  context: async ({ context }, use) => {
    await prepareContext(context)
    await use(context)
  },
})

export { expect } from '@playwright/test'

/**
 * Ticks a Chakra checkbox.
 *
 * Chakra v3 renders a visually-hidden `<input type="checkbox">` under a
 * `[data-part="control"]` div that sits on top of it, so clicking the input
 * itself never lands — Playwright reports the control as intercepting. The
 * control is the real hit target.
 */
export const checkCheckbox = async (scope: Locator): Promise<void> => {
  await scope.locator('[data-scope="checkbox"][data-part="control"]').first().click()
}

/**
 * Picks an option in a `chakra-react-select` combobox (the group selector, the
 * column mappers). These are div-based comboboxes, not `<select>`, so
 * `selectOption` does not apply: open it, then click the rendered option.
 */
export const selectComboboxOption = async (
  page: Page,
  combobox: Locator,
  optionText: string | RegExp
): Promise<void> => {
  await combobox.click()
  await page.getByRole('option', { name: optionText }).first().click()
}

/**
 * Flips a Chakra switch. Same shape as the checkbox: the visible control sits
 * over a hidden input, so the control is the hit target. Note that
 * `[data-scope="switch"]` alone matches root, control and thumb — always
 * qualify with `data-part`.
 */
export const toggleSwitch = async (scope: Locator): Promise<void> => {
  await scope.locator('[data-scope="switch"][data-part="control"]').first().click()
}

/**
 * Types a code into a Chakra PinInput (signup verification, CSP 2FA).
 *
 * The inputs are separate one-character boxes, so each is filled in turn. Both
 * forms that use this submit themselves once the last box is filled — do NOT
 * also click their submit button, or the click races the request already in
 * flight and lands on a detached element.
 */
export const fillPinInput = async (scope: Locator, code: string): Promise<void> => {
  const inputs = scope.locator('input[data-scope="pin-input"][data-part="input"]')
  for (let index = 0; index < code.length; index++) {
    await inputs.nth(index).fill(code[index])
  }
}
