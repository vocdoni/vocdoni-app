import { describe, expect, it } from 'vitest'
import { captureNames } from './routes.mjs'

describe('captureNames', () => {
  it('names each route and state per viewport and mode, as snapshot.mjs writes them', () => {
    const routes = [{ slug: 'r', states: [{ slug: 's' }] }]
    expect(captureNames({ routes, viewports: [1440, 390], modes: ['light'] })).toEqual([
      'r-1440-light',
      'r--s-1440-light',
      'r-390-light',
      'r--s-390-light',
    ])
  })

  it('leaves a state out at the viewports it does not list', () => {
    const routes = [{ slug: 'r', states: [{ slug: 's', viewports: [1440] }] }]
    expect(captureNames({ routes, viewports: [1440, 390], modes: ['dark'] })).toEqual([
      'r-1440-dark',
      'r--s-1440-dark',
      'r-390-dark',
    ])
  })

  it('covers the real routes at the default viewports and modes', () => {
    const names = captureNames({ viewports: [1440, 390], modes: ['light', 'dark'] })
    expect(names).toContain('dashboard--user-menu-1440-dark')
    expect(names).not.toContain('dashboard--user-menu-390-dark')
    expect(names).toContain('signin-390-light')
    expect(names).not.toContain('plans-loggedin-1440-dark')
  })
})
