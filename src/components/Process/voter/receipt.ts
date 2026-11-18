import { useAppEnv } from '~src/app-env'
import { getVocdoniClientConfig } from '~src/providers/vocdoni-client-config'

/** The Explorer's base URL for this deployment's vochain environment. */
export const useExplorerUrl = (): string => {
  const { VOCDONI_ENVIRONMENT } = useAppEnv()
  return getVocdoniClientConfig(VOCDONI_ENVIRONMENT).explorerUrl ?? 'https://explorer.vote'
}

/** Where one receipt code is verified. */
export const verifyUrlFor = (explorerUrl: string, code: string): string => `${explorerUrl}/verify/${code}`

export type ReceiptCodeCheck = { ok: true; code: string } | { ok: false; reason: 'incomplete' | 'format' }

const HEX_64 = /^[0-9a-f]{64}$/

/**
 * A pasted receipt code: 64 hex characters, with an optional `0x` and surrounding whitespace, normalised to lowercase
 * with no prefix. A shortened one (the receipt prints "a3f1…9c2e") is told apart from any other malformed value.
 */
export const checkReceiptCode = (value: string): ReceiptCodeCheck => {
  const trimmed = value.trim()
  if (trimmed.includes('…') || trimmed.includes('...')) return { ok: false, reason: 'incomplete' }
  const code = trimmed.replace(/^0x/i, '').toLowerCase()
  return HEX_64.test(code) ? { ok: true, code } : { ok: false, reason: 'format' }
}

export type ReceiptEntry = { title: string; code: string; url: string }

/** The receipt as a text file: the vote's title, then each question's title, its code and where to verify it. */
export const receiptText = (voteTitle: string, entries: readonly ReceiptEntry[]): string =>
  [voteTitle, ...entries.map((entry) => `${entry.title}\n${entry.code}\n${entry.url}`)].join('\n\n') + '\n'

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
  URL.revokeObjectURL(url)
}
