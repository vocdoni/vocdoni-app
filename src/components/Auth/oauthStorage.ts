// The storage the @vocdoni/rainbowkit-wallets Google OAuth connector writes, mirrored here so the
// session code every page loads can read and clear it without bundling that package and viem.
// oauthStorage.test.ts fails if these drift from the package.
export const OAuthStorageKeys = {
  Token: 'authToken',
  Expiry: 'authExpiry',
  Registered: 'authRegistered',
} as const

// The connector's wallet seed, and the session key that encrypts it.
export const OAuthWalletStorageKeys = {
  Seed: 'localstorage-wallet-seed',
  SeedEncryption: 'session-wallet-encryption-key',
} as const

// Same as the package's clearAuthStorageKeys() plus clearLocalStorageWalletSeed(). Dropping the
// seed is what disconnecting the connector does; a seed left behind makes the next Google sign-in
// reuse it and skip the OAuth popup and the backend login.
export const clearOAuthStorage = () => {
  if (typeof localStorage !== 'undefined') {
    Object.values(OAuthStorageKeys).forEach((key) => localStorage.removeItem(key))
    localStorage.removeItem(OAuthWalletStorageKeys.Seed)
  }
  if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(OAuthWalletStorageKeys.SeedEncryption)
}
