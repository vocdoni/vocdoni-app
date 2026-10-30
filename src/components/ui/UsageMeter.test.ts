import { describe, expect, it } from 'vitest'
import { usageMeterFill } from './UsageMeter'

describe('usageMeterFill', () => {
  it.each([
    [79, 'chart.2'],
    [80, 'meter.warning'],
    [99, 'meter.warning'],
    [100, 'meter.critical'],
    [120, 'meter.critical'],
  ])('a hard limit at %i %% fills with %s', (value, fill) => {
    expect(usageMeterFill({ value, max: 100, color: 'chart.2' })).toBe(fill)
  })

  it('keeps the series colour on a soft limit', () => {
    expect(usageMeterFill({ value: 150, max: 100, softLimit: true, color: 'chart.3' })).toBe('chart.3')
  })

  it('falls back to the meter colour with no series and no limit', () => {
    expect(usageMeterFill({ value: 5, max: 0 })).toBe('meter.ok')
  })
})
