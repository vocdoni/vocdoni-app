import { checkReceiptCode, receiptClipboardText, receiptText } from './receipt'

const CODE = '7f3a9c2e41d0b85e6a1f2c9d4b7e0a3f5c8d1e6b9a2f4c7d0e3b6a9f1c4d7e2a'

describe('checkReceiptCode', () => {
  it('accepts 64 hex characters, trimmed, with an optional 0x, normalised to lowercase with no prefix', () => {
    expect(checkReceiptCode(CODE)).toEqual({ ok: true, code: CODE })
    expect(checkReceiptCode(`  ${CODE}\n`)).toEqual({ ok: true, code: CODE })
    expect(checkReceiptCode(`0x${CODE}`)).toEqual({ ok: true, code: CODE })
    expect(checkReceiptCode(`0X${CODE.toUpperCase()}`)).toEqual({ ok: true, code: CODE })
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

  it('puts one title and code per line on the clipboard', () => {
    expect(receiptClipboardText(entries)).toBe('Accounts: aa\nBoard: bb')
  })
})
