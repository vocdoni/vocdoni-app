import { describe, expect, it } from 'vitest'
import { system } from '../system'

const button = system.cva(system.getRecipe('button'))
const input = system.cva(system.getRecipe('input'))
const textarea = system.cva(system.getRecipe('textarea'))

// The declarations a recipe layer ends up with.
const layer = (styles: unknown) => (styles as Record<string, Record<string, unknown>>)['@layer recipes']
const height = (styles: unknown) => layer(styles).height ?? layer(styles).h

// A responsive declaration: the phone value at the top, the tablet one under the `md` query (48em) and the
// desktop one under `lg` (64em).
const steps = (styles: unknown, ...props: string[]) => {
  const at = (node: Record<string, unknown>) => props.map((prop) => node[prop]).find((value) => value !== undefined)
  const rules = layer(styles)
  const media = (min: string) => {
    const key = Object.keys(rules).find((name) => name.startsWith('@media') && name.includes(`min-width: ${min}`))
    return key ? at(rules[key] as Record<string, unknown>) : undefined
  }
  return { base: at(rules), md: media('48em'), lg: media('64em') }
}
const var_ = (token: string) => `var(--chakra-sizes-${token})`
const touch = var_('control-touch')
const tablet = var_('control-tablet')

describe('button', () => {
  it.each(['md', 'lg', 'xl', '2xl', 'cta'] as const)('size %s is 44px, 40px, then the 34px control', (size) => {
    expect(steps(button({ size }), 'height', 'h')).toEqual({ base: touch, md: tablet, lg: var_('control-md') })
  })

  it.each(['2xs', 'xs', 'sm'] as const)('size %s is 44px, 40px, then the 28px compact control', (size) => {
    expect(steps(button({ size }), 'height', 'h')).toEqual({ base: touch, md: tablet, lg: var_('7') })
  })

  it('keeps the sidebar entry at 32px and the segment at 28px next to any size', () => {
    expect(height(button({ variant: 'nav-item', size: 'xs' }))).toBe('var(--chakra-sizes-8)')
    expect(height(button({ variant: 'nav-item', size: 'md' }))).toBe('var(--chakra-sizes-8)')
    expect(height(button({ variant: 'segment', size: 'md' }))).toBe('var(--chakra-sizes-7)')
  })

  it('draws the secondary with a ring and no border', () => {
    const outline = layer(button({ variant: 'outline' }))
    expect(outline.boxShadow).toBe('var(--chakra-shadows-shadow-control)')
    expect(outline.borderWidth).toBe('0')
    expect(outline.background).toBe('var(--chakra-colors-bg-panel)')
  })

  it('fills the primary from the palette and greys it when disabled', () => {
    const solid = button({ variant: 'solid' }) as Record<string, any>
    expect(layer(solid).background).toBe('var(--chakra-colors-color-palette-solid)')
    expect(JSON.stringify(solid)).toContain('var(--chakra-colors-bg-emphasized)')
  })

  it('keeps the loading primary filled and greys only a truly disabled one', () => {
    const solid = layer(button({ variant: 'solid' })) as Record<string, any>
    const disabled = solid['&:is(:disabled, [disabled], [data-disabled], [aria-disabled=true])']
    expect(disabled['&:not([data-loading])'].background).toBe('var(--chakra-colors-bg-emphasized)')
    expect(disabled['&[data-loading]']).toEqual({ opacity: '1', cursor: 'progress' })
    expect(solid.background).toBe('var(--chakra-colors-color-palette-solid)')
  })

  it('keeps the loading secondary ringed and inked', () => {
    const outline = layer(button({ variant: 'outline' })) as Record<string, any>
    const disabled = outline['&:is(:disabled, [disabled], [data-disabled], [aria-disabled=true])']
    expect(disabled['&[data-loading]']).toEqual({ opacity: '1', cursor: 'progress' })
    expect(outline.boxShadow).toBe('var(--chakra-shadows-shadow-control)')
  })

  it('hovers the secondary and the discreet look one step below the selected fill', () => {
    for (const variant of ['outline', 'ghost'] as const) {
      const styles = JSON.stringify(layer(button({ variant })))
      expect(styles).toContain('var(--chakra-colors-state-hover-bg)')
      expect(styles).not.toContain('state-selected-bg')
    }
  })
})

describe('input and textarea', () => {
  it('are 44px, 40px, then 34px panels with a ring and no border', () => {
    const styles = layer(input({}))
    expect(steps(input({}), '--input-height')).toEqual({ base: touch, md: tablet, lg: var_('control-md') })
    expect(styles.boxShadow).toBe('var(--chakra-shadows-shadow-field)')
    expect(styles.borderWidth).toBe('0')
  })

  it('keeps phone inputs at 16px so iOS Safari does not zoom on focus', () => {
    for (const size of ['sm', 'md'] as const) {
      const fontSize = layer(input({ size })).fontSize as unknown
      expect(JSON.stringify(fontSize)).toContain('font-sizes-lg')
      expect(system.token('fontSizes.lg')).toBe('1rem')
    }
  })

  it('keeps the inline variant flat', () => {
    expect(layer(input({ variant: 'inline' })).boxShadow).toBe('none')
  })

  it('has a 76px minimum height', () => {
    expect(layer(textarea({})).minHeight).toBe('var(--chakra-sizes-control-area)')
  })
})

describe('checkbox, radio and switch', () => {
  const checkboxStyles = system.getSlotRecipe('checkbox')
  const radioStyles = system.getSlotRecipe('radioGroup')

  it('draw 16px boxes whatever the size', () => {
    for (const size of ['sm', 'md', 'lg']) {
      expect(checkboxStyles.variants?.size?.[size]?.control).toMatchObject({ boxSize: '4' })
      expect(radioStyles.variants?.size?.[size]?.itemControl).toMatchObject({ boxSize: '4' })
    }
  })

  it('draw the unchecked outline in border.strong', () => {
    expect(checkboxStyles.variants?.variant?.solid?.control).toMatchObject({ borderColor: 'border.strong' })
    expect(radioStyles.variants?.variant?.solid?.itemControl).toMatchObject({ borderColor: 'border.strong' })
  })

  it('draws the switch track as a 36 by 20 box, not a pill', () => {
    const recipe = system.getSlotRecipe('switch')
    expect(recipe.variants?.size?.md?.root).toMatchObject({ '--switch-width': '36px', '--switch-height': '20px' })
    expect(recipe.variants?.variant?.solid?.control).toMatchObject({ borderRadius: 'l2' })
  })
})
