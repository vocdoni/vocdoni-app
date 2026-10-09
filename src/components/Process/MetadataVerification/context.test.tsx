import type { ProcessVerification } from '@vocdoni/metadata-verify'
import { mockUseElection, render, screen, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { MetadataVerificationProvider, useMetadataVerificationContext, useVerifiedMediaSrc } from './context'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return { ...actual, ...getReactProvidersMock() }
})

const verification = vi.hoisted(() => ({ current: {} as Record<string, unknown> }))
vi.mock('./useMetadataVerification', () => ({
  useMetadataVerification: () => verification.current,
}))

const HEADER = 'https://cdn.example.org/header.png'

const Probe = () => {
  const src = useVerifiedMediaSrc(HEADER)
  const gate = useMetadataVerificationContext()?.gate
  return (
    <>
      {src ? <img alt='header' src={src} /> : <span>no image</span>}
      <span>gate:{gate}</span>
    </>
  )
}

const verified: ProcessVerification = {
  status: 'verified',
  process: { electionId: 'p0', status: 'verified' },
  documents: [{ electionId: 'e1', status: 'verified' }],
  media: [
    {
      url: HEADER,
      coverage: 'content',
      committed: true,
      status: 'verified',
      expectedHash: 'ab',
      actualHash: 'ab',
      bytes: new TextEncoder().encode('png').buffer as ArrayBuffer,
    },
  ],
  urlOnly: [],
}

describe('MetadataVerificationProvider', () => {
  const createObjectURL = vi.fn(() => 'blob:verified-header')
  const revokeObjectURL = vi.fn()

  beforeEach(() => {
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()
    Object.assign(URL, { createObjectURL, revokeObjectURL })
    setReactProvidersMock({
      useElection: () => mockUseElection({ election: { id: 'p1', upstreamId: 'p0', questions: [] } }),
    })
  })

  it('renders a committed image from the verified bytes, never from its URL', async () => {
    verification.current = { enabled: true, isPending: false, isError: false, data: verified }

    render(
      <MetadataVerificationProvider>
        <Probe />
      </MetadataVerificationProvider>
    )

    expect(await screen.findByRole('img')).toHaveAttribute('src', 'blob:verified-header')
    expect(screen.getByText('gate:allowed')).toBeInTheDocument()
    expect(createObjectURL).toHaveBeenCalled()
  })

  it('shows no image and holds the vote while the check runs', () => {
    verification.current = { enabled: true, isPending: true, isError: false, data: undefined }

    render(
      <MetadataVerificationProvider>
        <Probe />
      </MetadataVerificationProvider>
    )

    expect(screen.getByText('no image')).toBeInTheDocument()
    expect(screen.getByText('gate:pending')).toBeInTheDocument()
  })

  it('releases the object URLs when the page goes away', async () => {
    verification.current = { enabled: true, isPending: false, isError: false, data: verified }

    const { unmount } = render(
      <MetadataVerificationProvider>
        <Probe />
      </MetadataVerificationProvider>
    )
    await screen.findByRole('img')
    unmount()

    await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith('blob:verified-header'))
  })
})

describe('useVerifiedMediaSrc outside the voter page', () => {
  it('keeps the original URL', () => {
    render(<Probe />)
    expect(screen.getByRole('img')).toHaveAttribute('src', HEADER)
  })
})
