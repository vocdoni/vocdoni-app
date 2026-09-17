import { renderHook } from '@testing-library/react'
import type { LoaderFunction, LoaderFunctionArgs } from 'react-router'
import { useRootRoutes } from './root'

vi.mock('~elements/Layout', () => ({ default: () => null }))
vi.mock('~elements/Error', () => ({ default: () => null }))
vi.mock('~src/app-env', () => ({ useAppEnv: () => ({ VOCDONI_ENVIRONMENT: 'dev' }) }))

const getElection = vi.fn().mockResolvedValue({ id: '0x1234' })
vi.mock('~src/providers/ApiClientProvider', () => ({
  useApiClient: () => ({ client: { elections: { get: getElection } } }),
}))

it('leaves the SPA document before rendering a public ballot', async () => {
  const { result } = renderHook(() => useRootRoutes())
  const route = result.current.children.find((route) => route.path === '/processes/:id')!
  const url = 'https://app.vocdoni.io/ca/processes/0x1234?foo=bar'
  const response = await (route.loader as LoaderFunction)({
    request: new Request(url),
    url: new URL(url),
    pattern: '/processes/:id',
    params: { id: '0x1234' },
    context: {},
  } as LoaderFunctionArgs)

  expect(response).toBeInstanceOf(Response)
  expect((response as Response).headers.get('Location')).toBe(url)
  expect((response as Response).headers.get('X-Remix-Reload-Document')).toBe('true')
  expect(getElection).not.toHaveBeenCalled()
  expect(route.element).toBeUndefined()
})
