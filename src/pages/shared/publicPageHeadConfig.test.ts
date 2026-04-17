import { describe, expect, it } from 'vitest'
import { getPublicPageDescription, getPublicPageTitle } from './publicPageHeadConfig'

describe('publicPageHeadConfig', () => {
  it('reads the public page title and description from loaded page metadata', () => {
    const pageContext = {
      data: {
        meta: {
          title: 'Vocdoni - Board election 2026',
          description: 'Vote for the next board members.',
        },
      },
    } as any

    expect(getPublicPageTitle(pageContext)).toBe('Vocdoni - Board election 2026')
    expect(getPublicPageDescription(pageContext)).toBe('Vote for the next board members.')
  })

  it('returns null when the public page metadata is unavailable', () => {
    expect(getPublicPageTitle({} as any)).toBeNull()
    expect(getPublicPageDescription({} as any)).toBeNull()
  })
})
