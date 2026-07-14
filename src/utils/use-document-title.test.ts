import { renderHook } from '@testing-library/react'
import { useDocumentTitle } from './use-document-title'

describe('useDocumentTitle', () => {
  const originalTitle = 'Original title'

  beforeEach(() => {
    document.title = originalTitle
  })

  it('sets the document title on mount', () => {
    renderHook(() => useDocumentTitle('Custom title'))

    expect(document.title).toBe('Custom title')
  })

  it('updates the document title when the title changes', () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: 'First title' },
    })

    rerender({ title: 'Second title' })

    expect(document.title).toBe('Second title')
  })

  it('restores the previous document title on unmount', () => {
    const { unmount } = renderHook(() => useDocumentTitle('Custom title'))

    unmount()

    expect(document.title).toBe(originalTitle)
  })

  it('restores the original title on unmount even after title changes', () => {
    const { rerender, unmount } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: 'First title' },
    })

    rerender({ title: 'Second title' })
    unmount()

    expect(document.title).toBe(originalTitle)
  })
})
