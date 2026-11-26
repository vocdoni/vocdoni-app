import { describe, expect, it } from 'vitest'
import { system } from '../system'

const progress = system.sva(system.getSlotRecipe('progress'))

// The declarations a slot gets from the recipe layer, to compare a variant with the props it replaced.
const layer = (styles: unknown) => (styles as Record<string, Record<string, unknown>>)['@layer recipes']

describe('progress variants that replaced look props', () => {
  it('meter draws what UsageMeter set by hand: size sm, shape full, the chart track and a rounded fill', () => {
    const byHand = progress({ size: 'sm', shape: 'full' })
    const meter = progress({ variant: 'meter' })
    expect(layer(meter.root)).toEqual(layer(byHand.root))
    expect(layer(meter.track)).toEqual({ ...layer(byHand.track), ...system.css({ bgColor: 'chart.track' }) })
    expect(layer(meter.range)).toEqual({ ...layer(byHand.range), ...system.css({ borderRadius: 'full' }) })
  })

  it('job draws what the members import set by hand: the outline look with md corners on root and track', () => {
    const axes = { size: 'md', striped: true, animated: true } as const
    const byHand = progress(axes)
    const job = progress({ ...axes, variant: 'job' })
    expect(layer(job.root)).toEqual({ ...layer(byHand.root), ...system.css({ borderRadius: 'md' }) })
    expect(layer(job.track)).toEqual({ ...layer(byHand.track), ...system.css({ borderRadius: 'md' }) })
    expect(layer(job.range)).toEqual(layer(byHand.range))
  })
})
