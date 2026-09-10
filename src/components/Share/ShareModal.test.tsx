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
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // `vi.unstubAllGlobals()` restores document/navigator via their original property
    // descriptors. Do not reassign `globalThis.document` by hand here: since vitest 5,
    // DOM global assignments propagate to the underlying jsdom window, whose `document`
    // is a getter-only accessor, so the write throws.
    vi.unstubAllGlobals()
    consoleErrorSpy.mockRestore()
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
