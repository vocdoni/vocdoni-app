import { Drawer } from './drawer'
import { Tabs } from './tabs'

describe('intent-named variants', () => {
  it('keeps the line as the default tab look and pill as the segmented control', () => {
    expect(Object.keys(Tabs.variants?.variant ?? {})).toEqual(['line', 'pill'])
    expect(Tabs.defaultVariants).toEqual({ variant: 'line' })
  })

  it('paints drawers from an explicit surface role', () => {
    const roles = Object.fromEntries(
      Object.entries(Drawer.variants?.variant ?? {}).map(([name, slots]) => [
        name,
        (slots as { content: { bg: string } }).content.bg,
      ])
    )

    expect(roles).toEqual({ sidebar: 'surface.overlay.drawer', panel: 'surface.overlay', sheet: 'surface.overlay' })
    expect(Drawer.defaultVariants).toEqual({ variant: 'panel' })
  })
})
