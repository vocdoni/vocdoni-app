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
})
