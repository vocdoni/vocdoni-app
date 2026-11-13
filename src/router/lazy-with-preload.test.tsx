import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { lazyWithPreload } from './lazy-with-preload'

const Page = () => <div>Page</div>

describe('lazyWithPreload', () => {
  it('imports the module once, whether preloaded first or rendered first', async () => {
    const factory = vi.fn(() => Promise.resolve({ default: Page }))
    const LazyPage = lazyWithPreload(factory)

    await LazyPage.preload()
    render(
      <Suspense fallback='waiting'>
        <LazyPage />
      </Suspense>
    )

    expect(await screen.findByText('Page')).toBeInTheDocument()
    expect(factory).toHaveBeenCalledTimes(1)
  })

  it('retries the import on render when the preload failed', async () => {
    const factory = vi
      .fn<() => Promise<{ default: typeof Page }>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({ default: Page })
    const LazyPage = lazyWithPreload(factory)

    await expect(LazyPage.preload()).rejects.toThrow('offline')
    render(
      <Suspense fallback='waiting'>
        <LazyPage />
      </Suspense>
    )

    expect(await screen.findByText('Page')).toBeInTheDocument()
    expect(factory).toHaveBeenCalledTimes(2)
  })
})
