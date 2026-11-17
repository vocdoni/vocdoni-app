import { describe, expect, it } from 'vitest'
import { system } from '../system'
import { Button } from './button'
import { Dialog } from './dialog'
import { input } from './form'
import { Menu } from './menu'
import { Tabs } from './tabs'

const steps = { base: 'control.touch', md: 'control.tablet', lg: 'control.md' }

// The three steps of a responsive value: phone, tablet from `md`, desktop from `lg`.
describe('responsive controls', () => {
  it('sizes a button 44px on a phone, 40px on a tablet and 34px on a desktop', () => {
    expect((Button.variants?.size?.md as Record<string, unknown>).h).toEqual(steps)
    expect((Button.variants?.size?.lg as Record<string, unknown>).h).toEqual(steps)
    expect(system.token('sizes.control.touch')).toBe('44px')
    expect(system.token('sizes.control.tablet')).toBe('40px')
    expect(system.token('sizes.control.md')).toBe('34px')
  })

  it('gives an icon button a 44px, 40px, 28px hit area', () => {
    const h = { base: 'control.touch', md: 'control.tablet', lg: '7' }
    expect((Button.variants?.size?.sm as Record<string, unknown>).h).toEqual(h)
    expect((Button.variants?.size?.sm as Record<string, unknown>).minW).toEqual(h)
  })

  it('sizes a chip 36px, 32px, 28px', () => {
    const chip = Button.compoundVariants?.find((entry) => entry.variant === 'chip')
    expect(chip?.css).toMatchObject({ h: { base: '9', md: '8', lg: '7' } })
  })

  it('sets field text at 16px, 14px, 13.5px and the field height in the same steps', () => {
    const field = input.variants?.size?.md as Record<string, unknown>
    expect(field.fontSize).toEqual({ base: 'lg', md: 'md', lg: 'control' })
    expect(field['--input-height']).toEqual({
      base: 'sizes.control.touch',
      md: 'sizes.control.tablet',
      lg: 'sizes.control.md',
    })
    expect(system.token('fontSizes.lg')).toBe('1rem')
    expect(system.token('fontSizes.md')).toBe('0.875rem')
    expect(system.token('fontSizes.control')).toBe('0.84375rem')
  })

  it('sizes a menu item 52px, 40px, 32px', () => {
    const item = (Menu.variants?.size?.md as { item: Record<string, unknown> }).item
    expect(item.minH).toEqual({ base: 'control.row', md: 'control.tablet', lg: '8' })
    expect(system.token('sizes.control.row')).toBe('52px')
  })

  it('draws a tab bar on one scrolling line, 44px tall below lg', () => {
    const line = Tabs.variants?.variant?.line as { list: Record<string, unknown>; trigger: Record<string, unknown> }
    expect(line.list).toMatchObject({ flexWrap: 'nowrap', overflowX: 'auto' })
    expect(line.trigger.h).toEqual({ base: 'control.touch', lg: 'auto' })
  })

  it('makes a dialog a bottom sheet below md and a centred dialog from md', () => {
    const center = Dialog.variants?.placement?.center as {
      positioner: { mdDown: Record<string, unknown> }
      content: { mdDown: Record<string, unknown> }
    }
    expect(Dialog.defaultVariants).toEqual({ placement: 'center' })
    expect(center.positioner.mdDown.alignItems).toBe('flex-end')
    expect(center.content.mdDown).toMatchObject({ maxW: 'full', borderTopRadius: 'xl', mx: '0' })
    expect(system.token('radii.xl')).toBe('12px')
  })
})

describe('responsive text styles', () => {
  it.each([
    ['page-title', 'page', '2xl', '1.5rem', '1.75rem'],
    ['item-title', 'lg', 'item', '1rem', '0.9375rem'],
    ['feature-title', 'feature', 'xl', '1.1875rem', '1.25rem'],
    ['vote-title', 'vote', '2xl', '1.375rem', '1.75rem'],
    ['meta', 'md', 'sm', '0.875rem', '0.8125rem'],
  ])('%s steps from %s to %s at md', (name, base, md, basePx, mdPx) => {
    const css = JSON.stringify(system.css({ textStyle: name } as never))
    expect(css).toContain(`--chakra-font-sizes-${base}`)
    expect(css).toContain(`--chakra-font-sizes-${md}`)
    expect(system.token(`fontSizes.${base}`)).toBe(basePx)
    expect(system.token(`fontSizes.${md}`)).toBe(mdPx)
  })

  it('steps the turnout headline 22px, 28px, 34px', () => {
    const css = JSON.stringify(system.css({ textStyle: 'turnout-headline' } as never))
    for (const step of ['vote', '2xl', 'headline']) expect(css).toContain(`--chakra-font-sizes-${step}`)
  })
})
