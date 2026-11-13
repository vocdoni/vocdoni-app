import { render, screen } from '@testing-library/react'
import type { ComponentType } from 'react'
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router'
import { lazyPage } from './lazy-page'

describe('lazyPage', () => {
  it('shows the route error element when the page code fails to load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const failing = async (): Promise<{ default: ComponentType }> => {
      throw new Error('chunk')
    }
    const router = createMemoryRouter(
      [
        {
          element: <Outlet />,
          children: [
            {
              HydrateFallback: () => <div>skeleton</div>,
              children: [{ path: '/x', lazy: lazyPage(failing), errorElement: <div>route error</div> }],
            },
          ],
        },
      ],
      { initialEntries: ['/x'] }
    )

    render(<RouterProvider router={router} />)

    expect(await screen.findByText('route error')).toBeInTheDocument()
  })
})
