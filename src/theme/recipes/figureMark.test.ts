import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { system } from '../system'
import { Avatar } from './avatar'
import { figureMark } from './figureMark'
import { StepMark } from './stepMark'

type Rules = Record<string, unknown>
const layer = (styles: unknown) => (styles as Record<string, Rules>)['@layer recipes']

describe('figureMark', () => {
  it('sets a line of 1 trimmed to the capital height and the baseline', () => {
    expect(figureMark).toEqual({ lineHeight: '[1]', textBox: '[trim-both cap alphabetic]' })
  })

  it('centres a step number by its ink', () => {
    expect(layer(system.cva(StepMark)({}))).toMatchObject({ lineHeight: '1', textBox: 'trim-both cap alphabetic' })
  })

  it('centres the avatar initials by their ink', () => {
    expect(layer(system.sva(Avatar)({}).fallback)).toMatchObject({
      lineHeight: '1',
      textBox: 'trim-both cap alphabetic',
    })
  })

  // The centring is a theme default: a mark gets it from its recipe, so no component sets it by hand.
  it('is never set outside the theme', () => {
    const src = resolve(__dirname, '../..')
    const files = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const path = join(dir, entry.name)
        if (entry.isDirectory()) return path.endsWith('/theme') ? [] : files(path)
        return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : []
      })
    const offenders = files(src)
      .filter((file) => /\btextBox\w*\b|\bfigureMark\b|text-box/.test(readFileSync(file, 'utf-8')))
      .map((file) => relative(src, file))
    expect(offenders, 'use a recipe that spreads figureMark (docs/ui-guidelines.md)').toEqual([])
  })
})
