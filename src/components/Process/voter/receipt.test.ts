import { afterEach, beforeEach, vi } from 'vitest'
import { checkReceiptCode, downloadText, hasExplorerFor, receiptClipboardText, receiptText } from './receipt'

const CODE = '7f3a9c2e41d0b85e6a1f2c9d4b7e0a3f5c8d1e6b9a2f4c7d0e3b6a9f1c4d7e2a'

describe('checkReceiptCode', () => {
  it('accepts 64 hex characters, trimmed, with an optional 0x, normalised to lowercase with no prefix', () => {
    expect(checkReceiptCode(CODE)).toEqual({ ok: true, code: CODE })
    expect(checkReceiptCode(`  ${CODE}\n`)).toEqual({ ok: true, code: CODE })
    expect(checkReceiptCode(`0x${CODE}`)).toEqual({ ok: true, code: CODE })
    expect(checkReceiptCode(`0X${CODE.toUpperCase()}`)).toEqual({ ok: true, code: CODE })
  })

  it('takes the code from a line of the copied codes, as "Title: code" (the clipboard text)', () => {
    expect(checkReceiptCode(`Accounts: ${CODE}`)).toEqual({ ok: true, code: CODE })
    expect(checkReceiptCode(`Accounts: 0x${CODE}\n`)).toEqual({ ok: true, code: CODE })
    expect(checkReceiptCode('Accounts: a3f1…9c2e')).toEqual({ ok: false, reason: 'incomplete' })
    expect(checkReceiptCode(`Accounts: ${CODE} and more`)).toEqual({ ok: false, reason: 'format' })
  })

  it('takes the code from a copied line whose title has an ellipsis: the code is complete', () => {
    expect(checkReceiptCode(`Vote 3…: ${CODE}`)).toEqual({ ok: true, code: CODE })
    expect(checkReceiptCode(`Vote 3...: ${CODE}`)).toEqual({ ok: true, code: CODE })
  })

  it('refuses several codes pasted together, such as the whole copied text', () => {
    const OTHER = 'b7c2000000000000001d4f000000000000000000000000000000000000000000'
    expect(checkReceiptCode(`Accounts: ${CODE}\nBoard: ${OTHER}`)).toEqual({ ok: false, reason: 'format' })
  })

  it('tells a shortened code from any other malformed one', () => {
    expect(checkReceiptCode('a3f1…9c2e')).toEqual({ ok: false, reason: 'incomplete' })
    expect(checkReceiptCode('a3f1...9c2e')).toEqual({ ok: false, reason: 'incomplete' })
    expect(checkReceiptCode('')).toEqual({ ok: false, reason: 'format' })
    expect(checkReceiptCode(CODE.slice(1))).toEqual({ ok: false, reason: 'format' })
    expect(checkReceiptCode(`${CODE}a`)).toEqual({ ok: false, reason: 'format' })
    expect(checkReceiptCode(`g${CODE.slice(1)}`)).toEqual({ ok: false, reason: 'format' })
  })
})

describe('hasExplorerFor', () => {
  it('is true only for a chain with an Explorer', () => {
    expect(hasExplorerFor('vocdoni/LTS/1')).toBe(true)
    expect(hasExplorerFor('vocdoni/TEST/1')).toBe(false)
  })
})

describe('receipt text', () => {
  const entries = [
    { title: 'Accounts', code: 'aa', url: 'https://x/verify/aa' },
    { title: 'Board', code: 'bb', url: 'https://x/verify/bb' },
  ]

  it('prints the vote title, then each question with its code and verification URL', () => {
    expect(receiptText('General assembly', entries)).toBe(
      'General assembly\n\nAccounts\naa\nhttps://x/verify/aa\n\nBoard\nbb\nhttps://x/verify/bb\n'
    )
  })

  it('leaves the URL out for a chain with no Explorer', () => {
    expect(receiptText('General assembly', [{ title: 'Accounts', code: 'aa' }])).toBe(
      'General assembly\n\nAccounts\naa\n'
    )
  })

  it('puts one title and code per line on the clipboard', () => {
    expect(receiptClipboardText(entries)).toBe('Accounts: aa\nBoard: bb')
  })
})

describe('downloadText', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    URL.createObjectURL = vi.fn(() => 'blob:receipt')
    URL.revokeObjectURL = vi.fn()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps the blob URL alive a moment after the click, so the browser can start the download', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    downloadText('receipt.txt', 'codes')
    expect(click).toHaveBeenCalledTimes(1)
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:receipt')
    click.mockRestore()
  })
})
