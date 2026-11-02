import { describe, expect, it } from 'vitest'
import { system } from '../system'

// Chakra draws these descriptions at 0.8 and 0.64, which drops them under 4.5:1 (toast on red.solid 3.53,
// radio card on fg.muted 3.17).
describe('description slots', () => {
  it.each([
    ['toast', 'description'],
    ['radioCard', 'itemDescription'],
  ])('%s %s resolves to full opacity', (name, slot) => {
    const styles = system.getSlotRecipe(name).base?.[slot] as Record<string, unknown>
    expect(system.css(styles as any)).toMatchObject({ opacity: '1' })
  })

  it('keeps the rest of Chakra toast and radioCard styles', () => {
    expect(system.getSlotRecipe('toast').base?.description).toMatchObject({ display: 'inline', textStyle: 'sm' })
    expect(system.getSlotRecipe('radioCard').base?.itemDescription).toMatchObject({ textStyle: 'sm' })
  })

  // Declaring a short slot list replaces Chakra's and strips the other slots of their styles.
  it('keeps the default styles of the other slots', () => {
    expect(system.getSlotRecipe('toast').base?.root).toMatchObject({
      bg: expect.anything(),
      borderRadius: expect.anything(),
    })
    expect(system.getSlotRecipe('toast').slots).toContain('root')
    expect(system.getSlotRecipe('radioCard').base?.root).toMatchObject({ gap: expect.anything() })
    expect(system.getSlotRecipe('radioCard').slots).toContain('root')
  })
})

// Chakra paints these on green.600 / orange.600 (3.30 and 3.56 with white text).
describe('toast contrast', () => {
  const root = () => system.getSlotRecipe('toast').base?.root as Record<string, Record<string, unknown>>
  const conditions = (name: string) =>
    system.tokens.getByName(name)?.extensions?.conditions as Record<string, string> | undefined

  it('paints success and warning on their own tokens', () => {
    expect(root()['&[data-type=success]']).toMatchObject({ bg: 'toast.success.bg' })
    expect(root()['&[data-type=warning]']).toMatchObject({ bg: 'toast.warning.bg' })
  })

  it('defines the tokens as dark enough fills', () => {
    expect(system.tokens.getByName('colors.toast.success.bg')?.originalValue).toBe('{colors.green.700}')
    expect(conditions('colors.toast.warning.bg')).toEqual({
      _light: '{colors.orange.700}',
      _dark: '{colors.orange.500}',
    })
  })

  // Chakra draws the X at 60%, which is 2.51:1 on the red error toast.
  it('draws the close button at 80%', () => {
    const styles = system.getSlotRecipe('toast').base?.closeTrigger as Record<string, unknown>
    expect(styles).toMatchObject({ color: '[{currentColor/80}]' })
    expect(JSON.stringify(system.css(styles as any))).toMatch(/currentColor 80%/)
  })
})
