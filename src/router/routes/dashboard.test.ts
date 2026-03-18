import { matchRoutes } from 'react-router-dom'
import { Routes } from '.'
import {
  dashboardProcessResultsChildPath,
  dashboardProcessRoutePath,
  shouldRevalidateDashboardProcess,
} from './dashboard'

describe('shouldRevalidateDashboardProcess', () => {
  it('does not revalidate when only switching between process tabs for the same id', () => {
    expect(
      shouldRevalidateDashboardProcess({
        currentParams: { id: '0xabc' },
        nextParams: { id: '0xabc' },
      })
    ).toBe(false)
  })

  it('revalidates when navigating to a different process id', () => {
    expect(
      shouldRevalidateDashboardProcess({
        currentParams: { id: '0xabc' },
        nextParams: { id: '0xdef' },
      })
    ).toBe(true)
  })
})

describe('dashboardProcessRoutePath', () => {
  it('models process and process results as explicit nested routes', () => {
    const matches = matchRoutes(
      [
        {
          path: dashboardProcessRoutePath,
          children: [{ index: true }, { path: dashboardProcessResultsChildPath }],
        },
      ],
      '/admin/process/0xabc/results'
    )

    expect(dashboardProcessRoutePath).toBe(Routes.dashboard.process)
    expect(dashboardProcessResultsChildPath).toBe(Routes.dashboard.processResults)
    expect(matches?.map((match) => match.route.path ?? 'index')).toEqual([
      Routes.dashboard.process,
      Routes.dashboard.processResults,
    ])
  })
})
