import type { RouteObject } from 'react-router'
import { prefetchRouteCode } from './route-prefetch'

const page = async () => ({ Component: () => null })

describe('prefetchRouteCode', () => {
  it('starts the code of every route the path matches, and only those', () => {
    const section = vi.fn(page)
    const tab = vi.fn(page)
    const other = vi.fn(page)
    const routes: RouteObject[] = [
      {
        path: '/admin',
        children: [
          { path: '/admin/processes', lazy: section, children: [{ path: '/admin/processes/all', lazy: tab }] },
          { path: '/admin/settings', lazy: other },
        ],
      },
    ]

    prefetchRouteCode(routes, '/admin/processes/all')

    expect(section).toHaveBeenCalledTimes(1)
    expect(tab).toHaveBeenCalledTimes(1)
    expect(other).not.toHaveBeenCalled()
  })

  it('follows a section index redirect to the code of the tab it lands on', () => {
    const section = vi.fn(page)
    const tab = vi.fn(page)
    const routes: RouteObject[] = [
      {
        path: '/admin/processes',
        lazy: section,
        children: [
          { index: true, handle: { redirectsTo: '/admin/processes/all' } },
          { path: '/admin/processes/all', lazy: tab },
        ],
      },
    ]

    prefetchRouteCode(routes, '/admin/processes')

    expect(section).toHaveBeenCalled()
    expect(tab).toHaveBeenCalledTimes(1)
  })

  it('ignores a failed download, which the navigation itself reports', async () => {
    const failing = vi.fn(() => Promise.reject(new Error('offline')))
    const routes: RouteObject[] = [{ path: '/admin/profile', lazy: failing }]

    expect(() => prefetchRouteCode(routes, '/admin/profile')).not.toThrow()
    await Promise.resolve()
    expect(failing).toHaveBeenCalledTimes(1)
  })

  it('does nothing for a path no route matches or before the routes exist', () => {
    expect(() => prefetchRouteCode(undefined, '/admin')).not.toThrow()
    expect(() => prefetchRouteCode([{ path: '/admin' }], '/nowhere')).not.toThrow()
  })
})
