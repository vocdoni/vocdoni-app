import { Drawer } from './drawer'
import { Tabs } from './tabs'

describe('intent-named variants', () => {
  it('keeps pill tabs as the only and default tab look', () => {
    expect(Object.keys(Tabs.variants?.variant ?? {})).toEqual(['pill'])
    expect(Tabs.defaultVariants).toEqual({ variant: 'pill' })
  })

  it('paints drawers from an explicit surface role', () => {
    const roles = Object.fromEntries(
      Object.entries(Drawer.variants?.variant ?? {}).map(([name, slots]) => [
        name,
        (slots as { content: { bg: string } }).content.bg,
      ])
    )

    expect(roles).toEqual({ navigation: 'surface.overlay.drawer', panel: 'surface.overlay' })
    expect(Drawer.defaultVariants).toEqual({ variant: 'panel' })
  })
})
