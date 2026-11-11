import { resolveCssVar, useCheckoutAppearance } from './stripe'

vi.mock('~theme/color-mode', () => ({
  useColorMode: () => ({ colorMode: 'light' }),
}))

// resolveCssVar is a module-level helper exported for testing
describe('resolveCssVar', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--test-color')
    document.documentElement.style.removeProperty('--test-chain')
    document.documentElement.style.removeProperty('--test-leaf')
  })

  it('reads a concrete CSS variable value', () => {
    document.documentElement.style.setProperty('--test-color', '#abcdef')
    expect(resolveCssVar('--test-color')).toBe('#abcdef')
  })

  it('resolves one level of var() indirection (Chakra semantic token chain)', () => {
    document.documentElement.style.setProperty('--test-leaf', '#fedcba')
    document.documentElement.style.setProperty('--test-chain', 'var(--test-leaf)')
    expect(resolveCssVar('--test-chain')).toBe('#fedcba')
  })

  it('returns an empty string for a missing variable', () => {
    expect(resolveCssVar('--chakra-does-not-exist')).toBe('')
  })
})

// useCheckoutAppearance is called outside a React tree here; color mode is mocked above.
// jsdom provides getComputedStyle and document, so reading CSS vars works.
describe('useCheckoutAppearance', () => {
  afterEach(() => {
    for (const v of [
      '--chakra-radii-l3',
      '--chakra-fonts-body',
      '--chakra-font-sizes-sm',
      '--chakra-colors-fg',
      '--chakra-colors-fg-muted',
      '--chakra-colors-fg-error',
      '--chakra-colors-brand-fg',
    ]) {
      document.documentElement.style.removeProperty(v)
    }
  })

  it('leaves an unset theme variable to Stripe instead of sending it empty', () => {
    const { appearance } = useCheckoutAppearance()
    expect(appearance?.variables).not.toHaveProperty('colorPrimary')
    expect(appearance?.variables?.colorBackground).toBe('white')
  })

  it('reads appearance variables from the theme CSS custom properties', () => {
    document.documentElement.style.setProperty('--chakra-radii-l3', '8px')
    document.documentElement.style.setProperty('--chakra-fonts-body', '"Inter", sans-serif')
    document.documentElement.style.setProperty('--chakra-font-sizes-sm', '0.875rem')
    document.documentElement.style.setProperty('--chakra-colors-fg', '#111111')
    document.documentElement.style.setProperty('--chakra-colors-fg-muted', '#777777')
    document.documentElement.style.setProperty('--chakra-colors-fg-error', '#cc0000')
    document.documentElement.style.setProperty('--chakra-colors-brand-fg', '#1a73e8')

    const { appearance } = useCheckoutAppearance()

    expect(appearance?.variables?.borderRadius).toBe('8px')
    expect(appearance?.variables?.fontFamily).toBe('"Inter", sans-serif')
    expect(appearance?.variables?.fontSizeBase).toBe('0.875rem')
    expect(appearance?.variables?.colorText).toBe('#111111')
    expect(appearance?.variables?.colorTextSecondary).toBe('#777777')
    expect(appearance?.variables?.colorDanger).toBe('#cc0000')
    expect(appearance?.variables?.colorPrimary).toBe('#1a73e8')
  })

  it('resolves var() chains (Chakra brand.fg references brand scale steps)', () => {
    document.documentElement.style.setProperty('--chakra-colors-brand-700', '#1a5b9b')
    document.documentElement.style.setProperty('--chakra-colors-brand-fg', 'var(--chakra-colors-brand-700)')

    const { appearance } = useCheckoutAppearance()

    expect(appearance?.variables?.colorPrimary).toBe('#1a5b9b')
  })
})
