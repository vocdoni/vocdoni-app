import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { baseLanguages } from '~i18n/languages'
import { getOpenGraphImagePath } from './openGraphImage'

const publicDir = resolve(__dirname, '../../../public')

describe('getOpenGraphImagePath', () => {
  it.each(Object.keys(baseLanguages))('points %s at a card that exists in public/', (language) => {
    const path = getOpenGraphImagePath(language)

    expect(path).toBe(`/assets/og/${language}.png`)
    expect(existsSync(resolve(publicDir, `.${path}`))).toBe(true)
  })

  it('falls back to the English card for missing or unsupported languages', () => {
    expect(getOpenGraphImagePath(undefined)).toBe('/assets/og/en.png')
    expect(getOpenGraphImagePath('xx')).toBe('/assets/og/en.png')
  })
})
