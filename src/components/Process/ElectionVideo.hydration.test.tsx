import { ChakraProvider } from '@chakra-ui/react'
import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { mockUseElection } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { getAppSystem } from '~theme/system'
import { ElectionVideo } from './ElectionVideo'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return { ...actual, ...getReactProvidersMock() }
})

vi.mock('react-player', () => ({ default: () => <div data-testid='player' /> }))

// Own file on purpose: the lazy player must still be unresolved when the server render runs, as on a
// first request. A sibling test that already loaded it would hide the problem.
describe('ElectionVideo hydration', () => {
  it('hydrates server-rendered HTML without a recoverable error', async () => {
    setReactProvidersMock({
      useElection: () => mockUseElection({ election: { id: 'p1', streamUri: 'https://example.test/live.m3u8' } }),
    })
    // vike-react renders with renderToString, where a suspended lazy boundary is reported on hydration.
    const element = (
      <ChakraProvider value={getAppSystem()}>
        <ElectionVideo />
      </ChakraProvider>
    )
    const container = document.createElement('div')
    document.body.appendChild(container)
    container.innerHTML = renderToString(element)
    const onRecoverableError = vi.fn()

    await act(async () => {
      hydrateRoot(container, element, { onRecoverableError })
    })

    expect(onRecoverableError).not.toHaveBeenCalled()
    container.remove()
  })
})
