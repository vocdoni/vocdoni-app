import { Button } from '@chakra-ui/react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { renderWithFlow, testFacts, testFlow } from '../test-flow'
import { VoterTopActions } from './VoterTopActions'

const routing = vi.hoisted(() => ({ navigateToLanguage: vi.fn(), currentLanguage: 'ca' }))
vi.mock('~i18n/usePublicLanguageRouting', () => ({ usePublicLanguageRouting: () => routing }))
vi.mock('~src/app-env', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/app-env')>()),
  useLanguagesEnv: () => ({ ca: 'Català', en: 'English' }),
}))

beforeEach(() => routing.navigateToLanguage.mockReset())

const pick = async (name: string) => {
  fireEvent.click(screen.getByRole('button', { name: 'voter.language.label' }))
  fireEvent.click(await screen.findByRole('menuitem', { name }))
}

describe('voter top bar actions', () => {
  it('shows the language as a tag and changes it at once before identification', async () => {
    renderWithFlow(<VoterTopActions />, testFlow({ facts: testFacts({ connected: false }) }))
    expect(screen.getByRole('button', { name: 'voter.language.label' })).toHaveTextContent('CA')
    expect(screen.queryByRole('button', { name: 'voter.sign_out' })).toBeNull()
    await pick('English')
    expect(routing.navigateToLanguage).toHaveBeenCalledWith('en')
  })

  it('asks first once the voter has identified, because the session would be lost (audit F14)', async () => {
    renderWithFlow(<VoterTopActions />, testFlow())
    await pick('English')
    expect(routing.navigateToLanguage).not.toHaveBeenCalled()
    fireEvent.click(await screen.findByRole('button', { name: 'voter.language.confirm' }))
    await waitFor(() => expect(routing.navigateToLanguage).toHaveBeenCalledWith('en'))
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
})
