import { renderHook } from '@testing-library/react'
import type { LoaderFunctionArgs } from 'react-router'
import { Routes } from '.'
import { useRootRoutes } from './root'

vi.mock('~src/providers/ApiClientProvider', () => ({ useApiClient: () => ({ client: {} }) }))
vi.mock('~src/app-env', () => ({ useAppEnv: () => ({ VOCDONI_ENVIRONMENT: 'dev' }) }))

const ballotRoute = () => {
  const { result } = renderHook(() => useRootRoutes())
  return result.current.children.find((route) => route.path === Routes.processes.view)!
}

describe('the ballot route', () => {
  // A ballot must never render inside the dashboard document: the loader
  // hands the very same URL to Vike as a full document load.
  it('redirects the document to the same URL', async () => {
    const request = new Request('https://app.test/processes/0x1234?foo=bar')

    const response = (await ballotRoute().loader!({ request } as LoaderFunctionArgs)) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('https://app.test/processes/0x1234?foo=bar')
    expect(response.headers.get('X-Remix-Reload-Document')).toBe('true')
  })

  // The redirect cannot throw and the SPA never cold-boots here, so anything
  // renderable on the route would be dead weight that implies otherwise.
  it('is loader-only', () => {
    const route = ballotRoute()

    expect(route.element).toBeUndefined()
    expect(route.errorElement).toBeUndefined()
    expect(route.HydrateFallback).toBeUndefined()
    expect(route.handle).toBeUndefined()
  })
})
