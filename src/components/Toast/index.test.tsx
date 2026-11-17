import { ChakraProvider } from '@chakra-ui/react'
import { render } from '@testing-library/react'
import { system } from '~theme/system'
import { ToastProvider } from './index'

// The setup file stubs this module for every test; this one exercises the real provider
vi.unmock('~components/Toast')

describe('ToastProvider', () => {
  it('keeps the toaster outside the app root, so a dialog making the root inert cannot hide its toasts', () => {
    const root = document.body.appendChild(Object.assign(document.createElement('div'), { id: 'root' }))
    try {
      render(
        <ChakraProvider value={system}>
          <ToastProvider>
            <p>app</p>
          </ToastProvider>
        </ChakraProvider>,
        { container: root }
      )

      const region = document.getElementById('toast-group:bottom')
      expect(region).toBeInTheDocument()
      expect(root.contains(region)).toBe(false)
    } finally {
      root.remove()
    }
  })
})
