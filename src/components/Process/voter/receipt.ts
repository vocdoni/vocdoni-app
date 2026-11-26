import { explorerUrl, explorerVoteUrl } from '@vocdoni/api-client'

/** Where one receipt code is verified: the Explorer of the vote's own chain, none for a chain without one. */
export const verifyUrlFor = (chainId: string | undefined, code: string): string | undefined =>
  explorerVoteUrl(chainId, code)

/** Whether the vote's chain has an Explorer to check a receipt code on. */
export const hasExplorerFor = (chainId: string | undefined): boolean => explorerUrl(chainId) !== undefined

export type ReceiptCodeCheck = { ok: true; code: string } | { ok: false; reason: 'incomplete' | 'format' }

/** The code ends the pasted value, after its title if it is a line of the clipboard text ("Accounts: 7f3a…"). */
const CODE_AT_END = /(?:^|[^0-9a-f])(?:0x)?([0-9a-f]{64})$/i

/**
 * A pasted receipt code: 64 hex characters, with an optional `0x`, alone or ending a line of the clipboard text, and
 * surrounding whitespace; normalised to lowercase with no prefix. A shortened one (the receipt prints "a3f1…9c2e") is
 * told apart from any other malformed value.
 */
export const checkReceiptCode = (value: string): ReceiptCodeCheck => {
  const trimmed = value.trim()
  // Several codes in one paste (the whole "Copy the codes" text) are not one code: the last one is not the answer.
  const codes = trimmed.match(/[0-9a-f]{64}/gi) ?? []
  const match = CODE_AT_END.exec(trimmed)
  if (match && codes.length === 1) return { ok: true, code: match[1].toLowerCase() }
  // An ellipsis only makes the code incomplete when no full code is in the text (a title may hold one).
  const shortened = !codes.length && (trimmed.includes('…') || trimmed.includes('...'))
  return { ok: false, reason: shortened ? 'incomplete' : 'format' }
}

export type ReceiptEntry = { title: string; code: string; url?: string }

/** The receipt as a text file: the vote's title, then each question's title, its code and where to verify it (if anywhere). */
export const receiptText = (voteTitle: string, entries: readonly ReceiptEntry[]): string =>
  [voteTitle, ...entries.map((entry) => [entry.title, entry.code, entry.url].filter(Boolean).join('\n'))].join('\n\n') +
  '\n'

/** The codes alone, one per line as "title: code", for the clipboard. */
export const receiptClipboardText = (entries: readonly ReceiptEntry[]): string =>
  entries.map((entry) => `${entry.title}: ${entry.code}`).join('\n')

/** Hands the browser a text file to save. */
export const downloadText = (fileName: string, text: string): void => {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Safari can cancel the download when the URL is gone before it starts: the revoke waits a moment, as utils/csv does.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
