import { describe, expect, it } from 'vitest'
import { system } from './system'
import { textStyles } from './textStyles'

describe('text styles', () => {
  // A token name that does not exist is emitted as-is (e.g. `font-size: body`) and silently dropped.
  it.each(Object.keys(textStyles))('%s resolves every token it names', (name) => {
    const css = system.css({ textStyle: name }) as Record<string, unknown>
    expect(css.fontSize).toMatch(/^var\(--chakra-font-sizes-/)
    for (const prop of ['fontWeight', 'letterSpacing'] as const) {
      if (prop in css) expect(css[prop]).toMatch(/^var\(--chakra-/)
    }
  })
})
