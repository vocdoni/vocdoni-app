import { act, render, screen } from '@testing-library/react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { indexRedirectResponse } from './dashboard'

vi.mock('@tanstack/react-query', () => ({ useQueryClient: () => ({}) }))

const routes = [
  { path: '/start', element: <p>start</p> },
  {
    path: '/admin/settings',
    children: [
      {
        index: true,
        loader: ({ request }: { request: Request }) => indexRedirectResponse(request, '/admin/settings/organization'),
      },
      { path: 'organization', element: <p>organization</p> },
    ],
  },
]

describe('indexRedirectResponse', () => {
  it('replaces the section root when it is the address being loaded', () => {
    window.history.replaceState(null, '', '/admin/settings')
    const res = indexRedirectResponse(new Request('http://localhost/admin/settings'), '/admin/settings/organization')
    expect(res.headers.get('X-Remix-Replace')).toBe('true')
  })

  it('pushes when the section is reached from another page', () => {
    window.history.replaceState(null, '', '/start')
    const res = indexRedirectResponse(new Request('http://localhost/admin/settings'), '/admin/settings/organization')
    expect(res.headers.has('X-Remix-Replace')).toBe(false)
  })

  it('lets Back leave a section that was opened directly', async () => {
    window.history.replaceState(null, '', '/start')
    window.history.pushState(null, '', '/admin/settings')
    const router = createBrowserRouter(routes)
    render(<RouterProvider router={router} />)
    expect(await screen.findByText('organization')).toBeInTheDocument()

    await act(() => router.navigate(-1))
    expect(await screen.findByText('start')).toBeInTheDocument()
    router.dispose()
  })
})
