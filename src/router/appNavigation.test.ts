import { navigateWithBasenameBypass, shouldBypassRouterBasename } from './appNavigation'

describe('appNavigation', () => {
  it('bypasses the router basename for unlocalized auth and admin targets', () => {
    expect(shouldBypassRouterBasename('/admin')).toBe(true)
    expect(shouldBypassRouterBasename('/admin/processes/all')).toBe(true)
    expect(shouldBypassRouterBasename('/account/signin')).toBe(true)
  })

  it('keeps localized public targets inside the router', () => {
    expect(shouldBypassRouterBasename('/ca/processes/0xabc')).toBe(false)
    expect(shouldBypassRouterBasename('/en/plans')).toBe(false)
  })

  it('uses document navigation for unlocalized targets', () => {
    const navigate = vi.fn()
    const assign = vi.fn()
    const replace = vi.fn()

    navigateWithBasenameBypass({
      to: '/admin',
      navigate,
      location: { assign, replace },
    })

    expect(assign).toHaveBeenCalledWith('/admin')
    expect(navigate).not.toHaveBeenCalled()
  })

  it('uses router navigation for localized public targets', () => {
    const navigate = vi.fn()
    const assign = vi.fn()
    const replace = vi.fn()

    navigateWithBasenameBypass({
      to: '/ca/processes/0xabc',
      navigate,
      location: { assign, replace },
    })

    expect(navigate).toHaveBeenCalledWith('/ca/processes/0xabc', undefined)
    expect(assign).not.toHaveBeenCalled()
  })
})
