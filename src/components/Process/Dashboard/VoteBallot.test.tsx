import { render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { VoteBallot } from './VoteBallot'

let questionsThrow = false

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
    ElectionDescription: () => <div>ElectionDescription</div>,
    ElectionQuestions: () => {
      if (questionsThrow) throw new Error('cannot infer ballot type')
      return <div>ElectionQuestions</div>
    },
  }
})

describe('VoteBallot', () => {
  afterEach(() => {
    questionsThrow = false
  })

  it('shows the description and the questions', () => {
    setReactProvidersMock({ useElection: () => ({ election: { id: '0xabc' } }) })

    render(<VoteBallot />)

    expect(screen.getByText('ElectionDescription')).toBeInTheDocument()
    expect(screen.getByText('ElectionQuestions')).toBeInTheDocument()
  })

  it('keeps the page up when the questions cannot render', async () => {
    questionsThrow = true
    setReactProvidersMock({ useElection: () => ({ election: { id: '0xabc' } }) })
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      render(<VoteBallot />)

      expect(await screen.findByText('This section could not be loaded')).toBeInTheDocument()
      expect(screen.getByText('ElectionDescription')).toBeInTheDocument()
    } finally {
      consoleError.mockRestore()
    }
  })
})
