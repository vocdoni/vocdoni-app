import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('SpreadsheetAccess theme', () => {
  const originalButtonScheme = import.meta.env.BUTTON_COLOR_SCHEME

  beforeEach(() => {
    vi.resetModules()
    import.meta.env.BUTTON_COLOR_SCHEME = 'yellow'
  })

  afterEach(() => {
    import.meta.env.BUTTON_COLOR_SCHEME = originalButtonScheme
  })

  it('uses BUTTON_COLOR_SCHEME for the button variant', async () => {
    const { theme } = await import('~theme')
    const { SpreadsheetAccess } = await import('./spreadsheetAccess')

    const props = {
      theme,
      colorMode: 'light',
    } as any

    const styles =
      typeof SpreadsheetAccess.baseStyle === 'function'
        ? SpreadsheetAccess.baseStyle(props)
        : SpreadsheetAccess.baseStyle
    const yellowVariant = theme.components.Button.variants.solid({ ...props, colorScheme: 'yellow' })
    const blackVariant = theme.components.Button.variants.solid({ ...props, colorScheme: 'black' })

    expect(yellowVariant.bg).toBeTruthy()
    expect(styles.button.bg).toBe(yellowVariant.bg)
    expect(styles.button.bg).not.toBe(blackVariant.bg)
  })
})
