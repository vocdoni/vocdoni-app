import { AuthStorageKeys, clearAuthStorageKeys, clearLocalStorageWalletSeed } from '@vocdoni/rainbowkit-wallets'
import { clearOAuthStorage, OAuthStorageKeys, OAuthWalletStorageKeys } from './oauthStorage'

const removedKeys = (clear: () => void) => {
  const spy = vi.spyOn(Storage.prototype, 'removeItem')
  clear()
  const keys = spy.mock.calls.map(
    ([key], index) => `${spy.mock.contexts[index] === sessionStorage ? 'session' : 'local'}:${key}`
  )
  spy.mockRestore()
  return keys.sort()
}

describe('OAuth storage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('reads the keys the OAuth connector writes', () => {
    expect(OAuthStorageKeys).toEqual(AuthStorageKeys)
  })

  it('clears the same keys as the package clears a session and its wallet seed', () => {
    expect(removedKeys(clearOAuthStorage)).toEqual(
      removedKeys(() => {
        clearAuthStorageKeys()
        clearLocalStorageWalletSeed()
      })
    )
  })

  it('drops the stored token and the wallet seed', () => {
    localStorage.setItem(OAuthStorageKeys.Token, 'token')
    localStorage.setItem(OAuthStorageKeys.Expiry, 'expiry')
    localStorage.setItem(OAuthStorageKeys.Registered, 'true')
    localStorage.setItem(OAuthWalletStorageKeys.Seed, '{"type":"plain","pk":"0x1"}')
    sessionStorage.setItem(OAuthWalletStorageKeys.SeedEncryption, 'secret')
    localStorage.setItem('signerAddress', '0xabc')

    clearOAuthStorage()

    expect(localStorage.length).toBe(1)
    expect(localStorage.getItem('signerAddress')).toBe('0xabc')
    expect(sessionStorage.length).toBe(0)
  })
})
