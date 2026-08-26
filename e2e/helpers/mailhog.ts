/**
 * Reads the emails the saas-backend sends, out of the MailHog inbox the
 * integration stack runs (integration/docker-compose.ci.yml).
 *
 * This is the piece the whole suite exists for: OTP codes and verification
 * links are invisible in dev and unassertable in CI without it. The same inbox
 * is browsable by a human at http://localhost:8025 while the stack is up.
 */

const MAILHOG_URL = (
  process.env.MAILHOG_URL || `http://localhost:${process.env.INTEGRATION_MAILHOG_PORT || 8025}`
).replace(/\/$/, '')

/** Subjects the backend sends, from saas-backend/assets/*_en.yaml. */
export const MailSubjects = {
  /** Account signup verification. Body: `Your Vocdoni verification code is: <code>`. */
  accountVerification: 'Verify Your Vocdoni Account',
  /**
   * CSP 2FA challenge. Full subject is `Verification Code - <organization>`,
   * body `Your verification code is: <code>`.
   *
   * NOTE the overlap: the account-verification body contains this body as a
   * substring, so a code extracted by body pattern alone can come from the
   * wrong mail. Always select by subject (and recipient) first — which is what
   * `waitForEmail` does.
   */
  twoFactorChallenge: 'Verification Code',
  passwordReset: 'Vocdoni password reset',
  organizationInvite: 'Vocdoni organization invitation',
} as const

export type Email = {
  id: string
  subject: string
  to: string[]
  /** The `text/plain` MIME part, decoded — never the HTML one. */
  body: string
  createdAt: Date
}

type MailHogPart = {
  Headers?: Record<string, string[]>
  Body?: string
}

type MailHogMessage = {
  ID: string
  Created: string
  Content?: { Headers?: Record<string, string[]>; Body?: string }
  MIME?: { Parts?: MailHogPart[] } | null
}

/**
 * Decodes quoted-printable.
 *
 * The stack's mails currently arrive as `7bit`, so this is usually a no-op —
 * but transfer encoding is the mailer's choice and has bitten this exact code
 * path before. Keep it. The classic trap it guards against: QP encodes `=` as
 * `=3D`, so `code=843885` on the wire reads `code=3D843885`, and a naive
 * `/code=(\w+)/` silently captures `3D843885`. Match on prose, not on `=`.
 */
const decodeQuotedPrintable = (input: string): string =>
  input.replace(/=\r?\n/g, '').replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))

const headerValue = (headers: Record<string, string[]> | undefined, name: string): string => headers?.[name]?.[0] ?? ''

/**
 * The plain-text body, preferred over the raw multipart blob: the HTML part
 * repeats the code inside markup (and the subject inside `<title>`), so
 * regexing the whole message can match the wrong occurrence.
 */
const plainTextBody = (message: MailHogMessage): string => {
  const parts = message.MIME?.Parts ?? []
  const plain = parts.find((part) => headerValue(part.Headers, 'Content-Type').startsWith('text/plain'))
  const raw = plain?.Body ?? message.Content?.Body ?? ''
  return decodeQuotedPrintable(raw)
}

const toEmail = (message: MailHogMessage): Email => ({
  id: message.ID,
  subject: decodeQuotedPrintable(headerValue(message.Content?.Headers, 'Subject')),
  to: message.Content?.Headers?.To ?? [],
  body: plainTextBody(message),
  createdAt: new Date(message.Created),
})

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${MAILHOG_URL}${path}`, init)
  if (!response.ok) {
    throw new Error(`MailHog ${init?.method ?? 'GET'} ${path} failed: ${response.status} ${await response.text()}`)
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T)
}

/** Every message currently addressed to `recipient`, newest first. */
export const inboxFor = async (recipient: string): Promise<Email[]> => {
  const data = await request<{ items?: MailHogMessage[] }>(
    `/api/v2/search?kind=to&query=${encodeURIComponent(recipient)}`
  )
  return (data.items ?? []).map(toEmail).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export type WaitForEmailOptions = {
  /** Recipient address to search for. */
  to: string
  /** Substring the subject must contain — how mail *kinds* are told apart. */
  subject: string
  /**
   * Ignore anything delivered at or before this instant. Pass the time taken
   * just before the action that triggers the mail, so a re-run of the same
   * flow for the same address (a resend, a retry) reads the NEW code and not
   * the stale one still sitting in the inbox.
   */
  since?: Date
  timeoutMs?: number
  pollIntervalMs?: number
}

export const waitForEmail = async ({
  to,
  subject,
  since,
  timeoutMs = 60_000,
  pollIntervalMs = 1_000,
}: WaitForEmailOptions): Promise<Email> => {
  const deadline = Date.now() + timeoutMs
  let lastSeen: Email[] = []

  while (Date.now() < deadline) {
    lastSeen = await inboxFor(to)
    const match = lastSeen.find(
      // `>=` would re-accept a mail delivered in the same millisecond as the
      // trigger, which is the stale one we are trying to skip.
      (email) => email.subject.includes(subject) && (!since || email.createdAt > since)
    )
    if (match) return match
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
  }

  throw new Error(
    `Timed out after ${timeoutMs}ms waiting for an email to ${to} with subject containing "${subject}".` +
      ` Inbox holds: ${JSON.stringify(lastSeen.map((email) => ({ subject: email.subject, at: email.createdAt })))}`
  )
}

/**
 * The numeric/alphanumeric code out of a verification or 2FA mail.
 *
 * Matches the shared tail of both templates (`…verification code is: <code>`)
 * — safe only because the caller already picked the right mail by subject.
 */
export const extractCode = (email: Email): string => {
  const match = email.body.match(/verification code is:\s*([A-Za-z0-9]+)/)
  if (!match) {
    throw new Error(`No verification code in "${email.subject}". Body was:\n${email.body}`)
  }
  return match[1]
}

/** The action link out of a mail that carries one (verify, password reset, invite). */
export const extractLink = (email: Email): string => {
  const match = email.body.match(/https?:\/\/\S+/)
  if (!match) {
    throw new Error(`No link in "${email.subject}". Body was:\n${email.body}`)
  }
  return match[0]
}

/** Waits for a mail and returns its code in one step. */
export const waitForCode = async (options: WaitForEmailOptions): Promise<string> =>
  extractCode(await waitForEmail(options))
