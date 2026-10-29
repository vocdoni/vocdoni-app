import { act, renderHook, waitFor } from '@testing-library/react'
import type { CreateVotingProcessRequest, VotingProcessQuestion, VotingProcessResponse } from '@vocdoni/api-types'
import { ApiError, ErrorCode } from '~components/Auth/api'
import { mockUseElection } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { useCloneAsDraft } from './use-clone-as-draft'

// Mock dependencies
const mockNavigate = vi.fn()
const mockToast = vi.fn()
const mockMutateAsync = vi.fn()
let mockElection: VotingProcessResponse | null = null

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  generatePath: vi.fn((path: string) => path.replace(':page', '1')),
  createSearchParams: vi.fn((params: any) => new URLSearchParams(params)),
}))

vi.mock('~components/Toast', () => ({
  useToast: () => mockToast,
}))

vi.mock('../Create', () => ({
  useCreateProcess: () => ({
    mutateAsync: mockMutateAsync,
  }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (!options?.defaultValue) return key
      // Simple template string replacement for {{ count }}
      return options.defaultValue.replace('{{ count }}', options.count)
    },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}))

type MockChoice = {
  title: string
  description?: string
  image?: string
}

const SINGLE_CHOICE_PROTOCOL = {
  costExponent: 1,
  costFromWeight: false,
  maxVoteOverwrites: 0,
  maxCount: 1,
  maxValue: 1,
  maxTotalCost: 1,
  uniqueValues: false,
}

// Builds a question in the new voting-process shape. Per-choice extended info lives in
// `question.metadata.choices`, exactly as the create flow stores it.
function createMockQuestion(
  choices: MockChoice[],
  overrides: Partial<VotingProcessQuestion> = {}
): VotingProcessQuestion {
  const hasMeta = choices.some((c) => c.description !== undefined || c.image !== undefined)
  return {
    id: 'question-1',
    parentProcessId: 'process-1',
    title: { default: 'Test Question' },
    description: { default: 'Question Description' },
    choices: choices.map((choice, index) => ({ title: { default: choice.title }, value: index })),
    ballotProtocol: SINGLE_CHOICE_PROTOCOL,
    type: 'singlechoice',
    secretUntilTheEnd: false,
    status: 'ENDED',
    metadata: hasMeta
      ? { choices: choices.map((c, index) => ({ value: index, description: c.description, image: c.image })) }
      : undefined,
    ...overrides,
  }
}

// Helper function to create mock voting processes
function createMockElection(
  choices: MockChoice[],
  overrides: Partial<VotingProcessResponse> = {},
  questionOverrides: Partial<VotingProcessQuestion> = {}
): VotingProcessResponse {
  return {
    id: 'process-1',
    orgAddress: '0xorganization',
    title: { default: 'Test Election' },
    description: { default: 'Test Description' },
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-31T00:00:00Z',
    published: true,
    census: {},
    questions: [createMockQuestion(choices, questionOverrides)],
    ...overrides,
  }
}

const clonedRequest = (): CreateVotingProcessRequest => mockMutateAsync.mock.calls[0][0]

describe('useCloneAsDraft', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMutateAsync.mockReset()
    mockNavigate.mockReset()
    mockToast.mockReset()
    mockElection = null
    setReactProvidersMock({
      useElection: () => mockUseElection({ election: mockElection }),
    })
  })

  const cloneWith = async (election: VotingProcessResponse) => {
    mockElection = election
    mockMutateAsync.mockResolvedValue('draft-123')

    const { result } = renderHook(() => useCloneAsDraft())
    await act(async () => {
      await result.current.cloneAsDraft()
    })

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled())
  }

  // The field-by-field mapping is owned by draft-mapping.test; this only proves the hook
  // hands the mapped election to the create mutation under the election's organization.
  describe('the cloned draft request', () => {
    it('copies the process content into a new draft owned by the same organization', async () => {
      await cloneWith(createMockElection([{ title: 'Option 1' }, { title: 'Option 2' }]))

      expect(clonedRequest()).toMatchObject({
        orgAddress: '0xorganization',
        title: { default: 'Test Election' },
        description: { default: 'Test Description' },
        questions: [
          {
            title: { default: 'Test Question' },
            description: { default: 'Question Description' },
            type: 'singlechoice',
            choices: [
              { title: { default: 'Option 1' }, value: 0 },
              { title: { default: 'Option 2' }, value: 1 },
            ],
          },
        ],
      })
    })
  })

  describe('success flow', () => {
    it('shows a success toast and opens the new draft in the wizard', async () => {
      await cloneWith(createMockElection([{ title: 'Option 1' }]))

      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }))
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ search: expect.stringContaining('draftId=draft-123') }),
        { replace: true }
      )
    })
  })

  describe('error flow', () => {
    it('shows the draft limit and stays on the page when the account is over its drafts', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }])
      mockMutateAsync.mockRejectedValue(
        new ApiError({ error: 'draft limit', code: ErrorCode.DraftLimitReached }, new Response(null, { status: 400 }))
      )

      const { result } = renderHook(() => useCloneAsDraft())
      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'error', description: expect.stringContaining('limit of 20 drafts') })
        )
      })
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('shows the backend reason for any other refusal, such as a legacy process over the question cap', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }])
      mockMutateAsync.mockRejectedValue(new Error('a process can have at most 15 questions'))

      const { result } = renderHook(() => useCloneAsDraft())
      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'error', description: 'a process can have at most 15 questions' })
        )
      })
    })
  })

  describe('edge cases', () => {
    it('does nothing when the process has no questions', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }], { questions: [] })

      const { result } = renderHook(() => useCloneAsDraft())
      await act(async () => {
        await result.current.cloneAsDraft()
      })

      expect(mockMutateAsync).not.toHaveBeenCalled()
    })

    it('does nothing when there is no election', async () => {
      mockElection = null

      const { result } = renderHook(() => useCloneAsDraft())
      await act(async () => {
        await result.current.cloneAsDraft()
      })

      expect(mockMutateAsync).not.toHaveBeenCalled()
    })
  })
})
