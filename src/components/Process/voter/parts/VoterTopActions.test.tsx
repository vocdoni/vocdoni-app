import { Button } from '@chakra-ui/react'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { renderWithFlow, testFacts, testFlow } from '../test-flow'
import { VoterTopActions } from './VoterTopActions'

const routing = vi.hoisted(() => ({ navigateToLanguage: vi.fn(), currentLanguage: 'ca' }))
vi.mock('~i18n/usePublicLanguageRouting', () => ({ usePublicLanguageRouting: () => routing }))
vi.mock('~src/app-env', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/app-env')>()),
  useLanguagesEnv: () => ({ ca: 'Català', en: 'English' }),
}))

beforeEach(() => {
  routing.navigateToLanguage.mockReset()
  routing.currentLanguage = 'ca'
})

// The language menu is a zag machine: its open and select updates land a microtask after the click.
const pick = async (name: string) => {
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'CA voter.language.label' })))
  const item = await screen.findByRole('menuitem', { name })
  await act(async () => fireEvent.click(item))
}

describe('voter top bar actions', () => {
  it('shows the language as a tag and changes it at once before identification', async () => {
    await act(async () => renderWithFlow(<VoterTopActions />, testFlow({ facts: testFacts({ connected: false }) })))
    // Its accessible name starts with what it shows (axe label-content-name-mismatch).
    expect(screen.getByRole('button', { name: 'CA voter.language.label' })).toHaveTextContent(/^CA/)
    expect(screen.queryByRole('button', { name: 'voter.sign_out' })).toBeNull()
    await pick('English')
    expect(routing.navigateToLanguage).toHaveBeenCalledWith('en')
  })

  it('tags the Brazilian Portuguese vote apart from the Portuguese one', () => {
    routing.currentLanguage = 'pt-br'
    renderWithFlow(<VoterTopActions />, testFlow({ facts: testFacts({ connected: false }) }))
    expect(screen.getByRole('button', { name: 'PT-BR voter.language.label' })).toHaveTextContent('PT-BR')
  })

  it('asks first once the voter has identified, because the session would be lost (audit F14)', async () => {
    await act(async () => renderWithFlow(<VoterTopActions />, testFlow()))
    await pick('English')
    expect(routing.navigateToLanguage).not.toHaveBeenCalled()
    fireEvent.click(await screen.findByRole('button', { name: 'voter.language.confirm' }))
    await waitFor(() => expect(routing.navigateToLanguage).toHaveBeenCalledWith('en'))
  })

  it('asks first on the code screen too, where the reload would lose the code sent (gate F13)', async () => {
    await act(async () =>
      renderWithFlow(<VoterTopActions />, testFlow({ facts: testFacts({ connected: false, challengePending: true }) }))
    )
    await pick('English')
    expect(routing.navigateToLanguage).not.toHaveBeenCalled()
    expect(await screen.findByRole('button', { name: 'voter.language.confirm' })).toBeInTheDocument()
  })

  it('signs out from the top bar on every connected screen', () => {
    const flow = testFlow()
    renderWithFlow(<VoterTopActions />, flow)
    fireEvent.click(screen.getByRole('button', { name: 'voter.sign_out' }))
    expect(flow.signOut).toHaveBeenCalled()
  })

  it('draws "Surt" as top-bar text: the `topbar` variant with no size and nothing on top (conformance D-7)', () => {
    const { unmount } = renderWithFlow(<Button variant='topbar'>voter.sign_out</Button>, testFlow())
    const plain = screen.getByRole('button', { name: 'voter.sign_out' }).className
    unmount()
    renderWithFlow(<VoterTopActions />, testFlow())
    expect(screen.getByRole('button', { name: 'voter.sign_out' }).className).toBe(plain)
  })

  it('does not offer sign out while a cast is in flight (audit F15)', () => {
    renderWithFlow(<VoterTopActions />, testFlow({ facts: testFacts({ voting: true }) }))
    expect(screen.queryByRole('button', { name: 'voter.sign_out' })).toBeNull()
  })

  it('does not offer sign out between the tap on "Emet el vot" and the SDK taking the cast up', () => {
    renderWithFlow(<VoterTopActions />, testFlow({ casting: true }))
    expect(screen.queryByRole('button', { name: 'voter.sign_out' })).toBeNull()
  })
})
