import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { Route, Routes } from 'react-router'
import { render, screen, TestMemoryRouter, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { Routes as AppRoutes } from '~routes'
import ProcessCreate from './index'

// The whole wizard with 10 questions takes about 3 s per test alone, more on a busy CI runner
vi.setConfig({ testTimeout: 20_000 })

// Render probes: every editor and select counts its renders and mounts, so a test can tell which parts of the
// wizard a keystroke or an autosave re-rendered or remounted
const probes = vi.hoisted(() => ({
  next: 0,
  renders: new Map<number, number>(),
  mounts: 0,
}))

const mockApiClient = vi.hoisted(() => ({
  elections: { create: vi.fn(), update: vi.fn(), get: vi.fn(), publish: vi.fn() },
}))

vi.mock('~components/Editor', async () => {
  const React = await import('react')
  return {
    // Shows the value it mounted with, like the real (uncontrolled) editor
    default: ({ defaultValue }: { defaultValue?: string }) => {
      const id = React.useRef<number | null>(null)
      const mountedWith = React.useRef(defaultValue ?? '')
      if (id.current === null) id.current = probes.next++
      probes.renders.set(id.current, (probes.renders.get(id.current) ?? 0) + 1)
      React.useEffect(() => {
        probes.mounts++
      }, [])
      return React.createElement(
        'div',
        { 'data-testid': 'editor-probe', 'data-probe': id.current },
        mountedWith.current
      )
    },
  }
})

vi.mock('~components/Form/Select', async () => {
  const React = await import('react')
  return {
    Select: (props: { 'aria-label'?: string }) => {
      const id = React.useRef<number | null>(null)
      if (id.current === null) id.current = probes.next++
      probes.renders.set(id.current, (probes.renders.get(id.current) ?? 0) + 1)
      return React.createElement('div', {
        'data-testid': 'select-probe',
        'data-probe': id.current,
        'aria-label': props['aria-label'],
      })
    },
  }
})

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useBlocker: () => ({ state: 'unblocked', reset: vi.fn(), proceed: vi.fn() }),
}))

vi.mock('~src/app-env', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/app-env')>()),
  useAppEnv: () => ({ DISABLE_ANONYMOUS_VOTING: false }),
}))

vi.mock('~utils/analytics', () => ({
  AnalyticsEvent: {},
  AnalyticsEvents: { ProcessCreated: 'process_created', ProcessCreationFailed: 'process_creation_failed' },
}))

vi.mock('~components/AnalyticsProvider', () => ({
  useAnalytics: () => ({ trackEvent: vi.fn() }),
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ bearedFetch: vi.fn().mockResolvedValue(undefined), currentAddress: '0xorg' }),
}))

vi.mock('~queries/account', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~queries/account')>()),
  useProfile: () => ({ data: { organizations: [{ role: 'admin', organization: { address: '0xorg' } }] } }),
}))

// The sidebar has its own rules and queries; these tests are about the main column
vi.mock('./Sidebar', () => ({ CreateSidebar: () => null }))
vi.mock('./LiveStreamingInput', () => ({ LiveStreamingInput: () => null }))
vi.mock('./VoterAuthentication/VoterAuthDialogContext', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./VoterAuthentication/VoterAuthDialogContext')>()),
  VoterAuthDialogProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('~elements/dashboard/processes/drafts', () => ({
  useDeleteDraft: () => ({}),
}))

vi.mock('~src/providers/ApiClientProvider', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/providers/ApiClientProvider')>()),
  useApiClient: () => ({ client: mockApiClient }),
}))

const draftId = '6650f0c0c0c0c0c0c0c0c0c0'

/** A promise plus the handle to settle it, so a request can be held in flight. */
const deferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => {
    resolve = r
  })
  return { promise, resolve }
}

const renderWizard = (url = '/admin/processes/create') =>
  render(
    <TestMemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path={AppRoutes.processes.create} element={<ProcessCreate />} />
      </Routes>
    </TestMemoryRouter>
  )

const probeIds = (testId: string) => screen.getAllByTestId(testId).map((el) => Number(el.getAttribute('data-probe')))

const rendersOf = (ids: number[]) => ids.map((id) => probes.renders.get(id) ?? 0)

const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 50)))

/**
 * Saves a first draft (blurring the title autosaves it), then adds questions up to ten. The first save goes
 * first so that its draft read, on the code before #1991, could not drop a question added meanwhile.
 */
const withTenQuestions = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(await screen.findByPlaceholderText('Voting Process Title'), 'My vote')
  await user.click(screen.getByPlaceholderText('Add a title to the question'))
  await waitFor(() => expect(mockApiClient.elections.create).toHaveBeenCalled())
  await settle()
  const addQuestion = screen.getByRole('button', { name: 'Add question' })
  for (let i = 1; i < 10; i++) await user.click(addQuestion)
  await settle()
  const titles = screen.getAllByPlaceholderText('Add a title to the question')
  expect(titles).toHaveLength(10)
  return titles
}

describe('the create form while typing', () => {
  let lastWritten: Record<string, unknown>

  beforeEach(() => {
    probes.next = 0
    probes.renders.clear()
    probes.mounts = 0
    lastWritten = {}
    localStorage.clear()
    mockApiClient.elections.create.mockReset()
    mockApiClient.elections.create.mockImplementation(async (body: Record<string, unknown>) => {
      lastWritten = body
      return draftId
    })
    mockApiClient.elections.update.mockReset()
    mockApiClient.elections.update.mockImplementation(async (_id: string, body: Record<string, unknown>) => {
      lastWritten = body
    })
    // The stored draft reads back as the last body written to it, like the API does
    mockApiClient.elections.get.mockReset()
    mockApiClient.elections.get.mockImplementation(async () => ({ ...lastWritten, addOns: {} }))
    setReactProvidersMock({
      useOrganization: () => ({ organization: { address: '0xorg' } }),
      useClient: () => ({ client: mockApiClient, connected: true }),
    })
  })

  it('re-renders neither the form nor the other question cards on a keystroke, with 10 questions', async () => {
    const user = userEvent.setup()
    renderWizard()

    const titles = await withTenQuestions(user)

    // Focusing the field blurs the last one, which autosaves: let that settle before counting
    await user.click(titles[4])
    await settle()

    // The first editor is the process description, in the form root; one more per question card
    const [rootEditor, ...cardEditors] = probeIds('editor-probe')
    const typeSelects = probeIds('select-probe')
    expect(cardEditors).toHaveLength(10)
    expect(typeSelects).toHaveLength(10)
    const before = { root: rendersOf([rootEditor])[0], cards: rendersOf(cardEditors), selects: rendersOf(typeSelects) }

    const keystrokes = 'abcde'
    await user.keyboard(keystrokes)
    expect(titles[4]).toHaveValue(keystrokes)

    const perKeystroke = (after: number[], prev: number[]) => after.map((n, i) => (n - prev[i]) / keystrokes.length)
    const counts = {
      root: (rendersOf([rootEditor])[0] - before.root) / keystrokes.length,
      cards: perKeystroke(rendersOf(cardEditors), before.cards),
      selects: perKeystroke(rendersOf(typeSelects), before.selects),
    }
    // Reported in the task report: renders per keystroke of the form root, each card and each card's settings
    expect(counts.root).toBe(0)
    counts.cards.forEach((n, i) => i !== 4 && expect(n).toBe(0))
    counts.selects.forEach((n, i) => i !== 4 && expect(n).toBe(0))
    // The typed card itself may render, but never more than once per keystroke
    expect(counts.cards[4]).toBeLessThanOrEqual(1)
  })

  it('does not re-render the question cards when an autosave goes through', async () => {
    const user = userEvent.setup()
    renderWizard()

    const titles = await withTenQuestions(user)
    await user.type(titles[1], 'Second')
    await settle()
    mockApiClient.elections.update.mockClear()

    const [rootEditor, ...cardEditors] = probeIds('editor-probe')
    const before = { root: rendersOf([rootEditor])[0], cards: rendersOf(cardEditors) }

    // Leaving the field saves the draft, once
    await user.click(titles[2])
    await waitFor(() => expect(mockApiClient.elections.update).toHaveBeenCalledTimes(1))
    await settle()
    expect(mockApiClient.elections.update).toHaveBeenCalledTimes(1)

    const cards = rendersOf(cardEditors).map((n, i) => n - before.cards[i])
    cards.forEach((n) => expect(n).toBe(0))
  })
})

// #1890: question fields typed right after load were cleared once the first autosave's draft read came back
describe('the first autosave', () => {
  beforeEach(() => {
    probes.next = 0
    probes.renders.clear()
    probes.mounts = 0
    localStorage.clear()
    mockApiClient.elections.create.mockReset()
    mockApiClient.elections.update.mockReset()
    mockApiClient.elections.update.mockResolvedValue(undefined)
    mockApiClient.elections.get.mockReset()
    setReactProvidersMock({
      useOrganization: () => ({ organization: { address: '0xorg' } }),
      useClient: () => ({ client: mockApiClient, connected: true }),
    })
  })

  it('keeps what was typed while it ran, and remounts no editor', async () => {
    const user = userEvent.setup()
    const created = deferred<string>()
    let firstSave: Record<string, unknown> = {}
    mockApiClient.elections.create.mockImplementation((body: Record<string, unknown>) => {
      firstSave = body
      return created.promise
    })
    // Reading the draft back returns what the first save sent: the questions were still empty then
    mockApiClient.elections.get.mockImplementation(async () => ({ ...firstSave, addOns: {} }))
    renderWizard()

    await user.type(await screen.findByPlaceholderText('Voting Process Title'), 'My vote')
    // Moving on to the question blurs the title, which fires the first autosave
    await user.click(screen.getByPlaceholderText('Add a title to the question'))
    await waitFor(() => expect(mockApiClient.elections.create).toHaveBeenCalledTimes(1))

    // Typed while the draft is being created
    await user.keyboard('Which day?')
    await user.click(screen.getByPlaceholderText('Option 1'))
    await user.keyboard('Monday')
    const mountsBefore = probes.mounts

    await act(async () => created.resolve(draftId))
    await settle()

    expect(screen.getByPlaceholderText('Voting Process Title')).toHaveValue('My vote')
    expect(screen.getByPlaceholderText('Add a title to the question')).toHaveValue('Which day?')
    expect(screen.getByPlaceholderText('Option 1')).toHaveValue('Monday')
    expect(probes.mounts).toBe(mountsBefore)
    // The form already holds the draft it just created: nothing reads it back
    expect(mockApiClient.elections.get).not.toHaveBeenCalled()
  })
})

describe('an opened draft', () => {
  beforeEach(() => {
    localStorage.clear()
    mockApiClient.elections.create.mockReset()
    mockApiClient.elections.update.mockReset()
    mockApiClient.elections.update.mockResolvedValue(undefined)
    mockApiClient.elections.get.mockReset()
    mockApiClient.elections.get.mockResolvedValue({
      published: false,
      addOns: {},
      title: { default: 'Saved vote' },
      description: { default: 'Saved description' },
      questions: [
        {
          title: { default: 'Saved question' },
          type: 'singlechoice',
          choices: [
            { title: { default: 'Yes' }, value: 0 },
            { title: { default: 'No' }, value: 1 },
          ],
        },
      ],
    })
    setReactProvidersMock({
      useOrganization: () => ({ organization: { address: '0xorg' } }),
      useClient: () => ({ client: mockApiClient, connected: true }),
    })
  })

  it('is still read into the form, and kept there by its autosaves', async () => {
    const user = userEvent.setup()
    renderWizard(`/admin/processes/create?draftId=${draftId}`)

    const title = screen.getByPlaceholderText('Voting Process Title')
    await waitFor(() => expect(title).toHaveValue('Saved vote'))
    expect(screen.getByPlaceholderText('Add a title to the question')).toHaveValue('Saved question')
    expect(screen.getByPlaceholderText('Option 2')).toHaveValue('No')

    await user.type(title, ' edited')
    await user.click(screen.getByPlaceholderText('Add a title to the question'))
    await waitFor(() => expect(mockApiClient.elections.update).toHaveBeenCalled())
    await settle()

    expect(mockApiClient.elections.create).not.toHaveBeenCalled()
    expect(title).toHaveValue('Saved vote edited')
    expect(screen.getByPlaceholderText('Add a title to the question')).toHaveValue('Saved question')
  })

  it('is cleared from every field, the description editor included, by "Reset form"', async () => {
    const user = userEvent.setup()
    renderWizard(`/admin/processes/create?draftId=${draftId}`)

    await waitFor(() => expect(screen.getByPlaceholderText('Voting Process Title')).toHaveValue('Saved vote'))
    const descriptionEditor = () => screen.getAllByTestId('editor-probe')[0]
    expect(descriptionEditor()).toHaveTextContent('Saved description')

    await user.click(screen.getByRole('button', { name: 'Reset form' }))
    await user.click(await screen.findByRole('button', { name: 'Reset' }))
    await settle()

    expect(screen.getByPlaceholderText('Voting Process Title')).toHaveValue('')
    expect(screen.getByPlaceholderText('Add a title to the question')).toHaveValue('')
    expect(descriptionEditor()).toBeEmptyDOMElement()
  })
})
