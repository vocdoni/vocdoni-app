import { ChakraProvider } from '@chakra-ui/react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { system } from '~theme/system'
import ShareModalButton from './ShareModal'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('~components/Toast', () => ({
  useToast: () => vi.fn(),
}))

describe('ShareModalButton', () => {
  const originalDocument = globalThis.document
  const originalNavigator = globalThis.navigator
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    consoleErrorSpy.mockRestore()
    globalThis.document = originalDocument
    globalThis.navigator = originalNavigator
  })

  it('renders on the server without browser globals', () => {
    vi.stubGlobal('document', undefined)
    vi.stubGlobal('navigator', undefined)

    expect(() =>
      renderToString(
        <ChakraProvider value={system}>
          <ShareModalButton caption='Caption' text='Share' />
        </ChakraProvider>
      )
    ).not.toThrow()
  })
})
