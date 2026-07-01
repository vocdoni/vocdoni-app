import { renderHook } from '@testing-library/react'
import { AllProviders } from '~src/test-utils'
import { Routes } from '~src/router/routes'
import { useAdminMenuConfig, useIntegratorMenuConfig } from './menus'

describe('menu configs', () => {
  it('admin config points home to /admin and enables the admin-only bits', () => {
    const { result } = renderHook(() => useAdminMenuConfig(), { wrapper: AllProviders })

    expect(result.current.homeRoute).toBe(Routes.dashboard.base)
    expect(result.current.newVote).toBe(true)
    expect(result.current.tutorial).toBe(true)
    // Platform section + Help section
    expect(result.current.sections.length).toBe(2)
    const routes = result.current.sections.flatMap((s) => s.items.map((i) => i.route))
    expect(routes).toContain(Routes.dashboard.base)
    expect(routes).toContain(Routes.dashboard.processes.base)
  })

  it('integrator config points home to /integrators, no new-vote or tutorial', () => {
    const { result } = renderHook(() => useIntegratorMenuConfig(), { wrapper: AllProviders })

    expect(result.current.homeRoute).toBe(Routes.integrators.base)
    expect(result.current.newVote).toBe(false)
    expect(result.current.tutorial).toBe(false)
    const routes = result.current.sections.flatMap((s) => s.items.map((i) => i.route))
    expect(routes).toContain(Routes.integrators.base)
  })
})
