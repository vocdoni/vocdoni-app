describe('OAuth-only wagmi config', () => {
  it('does not register injected wallets announced by browser extensions', async () => {
    const announceWallet = () => {
      window.dispatchEvent(
        new CustomEvent('eip6963:announceProvider', {
          detail: {
            info: {
              uuid: 'c8085b86-4ad0-4d7d-a1d2-61f7907e8b99',
              name: 'Test wallet',
              icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
              rdns: 'com.example.wallet',
            },
            provider: {
              request: vi.fn().mockResolvedValue([]),
              on: vi.fn(),
              removeListener: vi.fn(),
            },
          },
        })
      )
    }

    window.addEventListener('eip6963:requestProvider', announceWallet)
    try {
      const { wagmiConfig } = await import('./wagmi')
      announceWallet()

      expect(wagmiConfig.connectors).toEqual([])
    } finally {
      window.removeEventListener('eip6963:requestProvider', announceWallet)
    }
  })
})
