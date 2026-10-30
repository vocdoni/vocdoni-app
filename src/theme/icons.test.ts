import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import * as icons from './icons'
import { system } from './system'

const SRC = path.resolve(__dirname, '..')
// Split so this file does not match its own check.
const PACK_IMPORT = new RegExp(`from '${'react-'}icons`)

const sourceFiles = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(full)
    return /\.tsx?$/.test(entry.name) ? [full] : []
  })

describe('icons by concept', () => {
  it('keeps every react-icons import inside theme/icons.tsx', () => {
    const offenders = sourceFiles(SRC).filter(
      (file) => file !== path.join(SRC, 'theme/icons.tsx') && PACK_IMPORT.test(fs.readFileSync(file, 'utf8'))
    )
    expect(offenders.map((file) => path.relative(SRC, file))).toEqual([])
  })

  it('exports every concept as a component', () => {
    const concepts = Object.entries(icons).filter(([name]) => name.endsWith('Icon'))
    expect(concepts.length).toBeGreaterThan(50)
    for (const [name, icon] of concepts) expect(typeof icon, name).toBe('function')
  })

  it('draws each glyph for one concept only', () => {
    const concepts = Object.entries(icons).filter(([name]) => name.endsWith('Icon'))
    const names = new Map<unknown, string[]>()
    for (const [name, icon] of concepts) names.set(icon, [...(names.get(icon) ?? []), name])
    expect([...names.values()].filter((shared) => shared.length > 1)).toEqual([])
  })

  it('defines the four icon sizes and sizes the icon recipe with the smallest', () => {
    // Each icon size is a step of the size scale, read through its CSS variable.
    const value = (name: string) => {
      const ref = /^var\((--[\w-]+)\)$/.exec(String(system.tokens.getByName(name)?.value))?.[1]
      return system.tokens.allTokens.find((token) => token.extensions.cssVar?.var === ref)?.value
    }
    expect([value('sizes.icon.sm'), value('sizes.icon.md'), value('sizes.icon.lg'), value('sizes.icon.xl')]).toEqual([
      '1rem',
      '1.25rem',
      '1.5rem',
      '3rem',
    ])
    expect(system.getRecipe('icon').base).toMatchObject({ boxSize: 'icon.sm' })
  })
})
