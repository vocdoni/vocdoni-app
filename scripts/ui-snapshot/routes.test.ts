import { describe, expect, it } from 'vitest'
import { captureNames, ROUTES } from './routes.mjs'

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
    expect(names).toContain('dashboard--nav-drawer-390-light')
    expect(names).not.toContain('dashboard--nav-drawer-1440-light')
    expect(names).toContain('signin-390-light')
  })

  it('counts each real route once per viewport and mode, and each state only where it runs', () => {
    const names = captureNames({ viewports: [1440, 390], modes: ['light', 'dark'] })
    // A state runs at each viewport its filter lists, or at every one without a filter.
    const states = ROUTES.flatMap((route) => route.states || [])
    const runsAt = (width: number) => states.filter((state) => !state.viewports || state.viewports.includes(width))
    expect(names).toHaveLength(2 * (2 * ROUTES.length + runsAt(1440).length + runsAt(390).length))
    expect(new Set(names).size).toBe(names.length)
  })
})
