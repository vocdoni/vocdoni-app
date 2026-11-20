import { QueryClientProvider } from '@tanstack/react-query'
import type { VocdoniApiClient } from '@vocdoni/api-client'
import { ClientProvider, ElectionProvider, useElection } from '@vocdoni/react-providers'
import { render, screen, waitFor } from '@testing-library/react'
import { createAppQueryClient } from '~src/query-client'
import { paginatedElectionsQuery } from './organization'

const list = vi.fn()
const client = { elections: { list } } as unknown as VocdoniApiClient

const process = (id: string) => ({
  id,
  chainId: 'vocdoni/LTS/1',
  title: { default: `Process ${id}` },
  questions: [],
  census: {},
})

const Row = () => {
  const { election } = useElection()
  return <li>{election?.id}</li>
}

describe('a process list row', () => {
  const requested = () =>
    (fetchMock.mock.calls as [Request | string][]).map(([input]) => (typeof input === 'string' ? input : input.url))
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock.mockImplementation(async () => new Response('{}', { status: 404 }))
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('renders the election the list seeded without asking the API for it again', async () => {
    list.mockResolvedValue({ processes: [process('p1'), process('p2')], pagination: {} })
    const queryClient = createAppQueryClient()
    const query = paginatedElectionsQuery('0xorg', client, {}, queryClient)

    const { processes } = await queryClient.fetchQuery({ queryKey: query.queryKey, queryFn: query.queryFn })

    render(
      <QueryClientProvider client={queryClient}>
        <ClientProvider apiUrl='http://api.test'>
          <ul>
            {processes.map((p: { id: string }) => (
              <ElectionProvider id={p.id} key={p.id}>
                <Row />
              </ElectionProvider>
            ))}
          </ul>
        </ClientProvider>
      </QueryClientProvider>
    )

    expect(screen.getByText('p1')).toBeInTheDocument()
    expect(screen.getByText('p2')).toBeInTheDocument()
    // The results are what a row still asks for (the SDK provider enables that query by itself);
    // the election itself comes from the list's cache.
    await waitFor(() => expect(requested().some((url) => url.includes('/results'))).toBe(true))
    expect(requested().filter((url) => /\/processes\/p[12]$/.test(url))).toEqual([])
  })
})
