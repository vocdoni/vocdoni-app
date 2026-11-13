import type { SystemStyleObject } from '@chakra-ui/react'
import { describe, expect, it } from 'vitest'
import { system } from './system'
import { textStyles } from './textStyles'

describe('text styles', () => {
  // A token name that does not exist is emitted as-is (e.g. `font-size: body`) and silently dropped.
  it.each(Object.keys(textStyles))('%s resolves every token it names', (name) => {
    const css = system.css({ textStyle: name as SystemStyleObject['textStyle'] }) as Record<string, unknown>
    const tokenProps = ['fontSize', 'fontFamily', 'fontWeight', 'letterSpacing'] as const
    expect(tokenProps.some((prop) => prop in css)).toBe(true)
    for (const prop of tokenProps) {
      if (prop in css) expect(css[prop], prop).toMatch(/^var\(--chakra-/)
    }
  })

  // Nothing reads these yet; they start equal to what a control and a figure render today.
  it('starts the control and figure roles at the look they have today', () => {
    expect(system.css({ textStyle: 'control' })).toEqual({
      fontSize: 'var(--chakra-font-sizes-control)',
      lineHeight: '1.25rem',
    })
    expect(system.css({ textStyle: 'figure' })).toEqual({ fontFamily: 'var(--chakra-fonts-figure)' })
    expect(system.token('fontSizes.control')).toBe('var(--chakra-font-sizes-sm)')
    expect(system.token('fonts.figure')).toBe(system.token('fonts.body'))
  })
})
