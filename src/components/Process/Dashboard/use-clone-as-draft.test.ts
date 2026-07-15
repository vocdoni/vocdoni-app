import { act, renderHook, waitFor } from '@testing-library/react'
import type { VotingProcessQuestion, VotingProcessResponse } from '@vocdoni/api-types'
import { mockUseElection } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { useCloneAsDraft } from './use-clone-as-draft'

// Mock dependencies
const mockNavigate = vi.fn()
const mockToast = vi.fn()
const mockMutateAsync = vi.fn()
const mockPermission = vi.fn()
let mockElection: VotingProcessResponse | null = null

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  generatePath: vi.fn((path: string) => path.replace(':page', '1')),
  createSearchParams: vi.fn((params: any) => new URLSearchParams(params)),
}))

vi.mock('~components/Toast', () => ({
  useToast: () => mockToast,
}))

vi.mock('~components/Auth/Subscription', () => ({
  useSubscription: () => ({
    permission: mockPermission,
  }),
}))

vi.mock('../Create', () => ({
  useCreateProcess: () => ({
    mutateAsync: mockMutateAsync,
  }),
  defaultProcessValues: {
    title: '',
    description: '',
    autoStart: true,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    extendedInfo: false,
    questionType: 'single-choice',
    questions: [],
    maxNumberOfChoices: null,
    minNumberOfChoices: null,
    resultVisibility: 'hidden',
    weightedVote: false,
    voterPrivacy: 'public',
    groupId: '',
    census: null,
    censusType: 'csp',
    streamUri: '',
    addresses: [],
    spreadsheet: null,
  },
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
    type: 'singleChoice',
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

describe('useCloneAsDraft', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMutateAsync.mockReset()
    mockNavigate.mockReset()
    mockToast.mockReset()
    mockPermission.mockReturnValue(5) // Default draft limit
    mockElection = null
    setReactProvidersMock({
      useElection: () =>
        mockUseElection({
          election: mockElection,
          client: { explorerUrl: 'https://explorer.example.com' },
        }),
    })
  })

  describe('extendedInfo detection', () => {
    it('should set extendedInfo to false when no choices have metadata', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }, { title: 'Option 2' }])

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              extendedInfo: false,
            }),
          })
        )
      })
    })

    it('should set extendedInfo to true when any choice has description (non-empty)', async () => {
      mockElection = createMockElection([
        { title: 'Option 1', description: 'Description for option 1' },
        { title: 'Option 2' },
      ])

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              extendedInfo: true,
            }),
          })
        )
      })
    })

    it('should set extendedInfo to true when any choice has image URL (non-empty)', async () => {
      mockElection = createMockElection([
        { title: 'Option 1', image: 'https://example.com/image.png' },
        { title: 'Option 2' },
      ])

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              extendedInfo: true,
            }),
          })
        )
      })
    })

    it('should set extendedInfo to false when image is empty string', async () => {
      mockElection = createMockElection([{ title: 'Option 1', image: '' }, { title: 'Option 2' }])

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              extendedInfo: false,
            }),
          })
        )
      })
    })

    it('should set extendedInfo to false when description is empty string', async () => {
      mockElection = createMockElection([{ title: 'Option 1', description: '' }, { title: 'Option 2' }])

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              extendedInfo: false,
            }),
          })
        )
      })
    })

    it('should set extendedInfo to true when choice has both description and image', async () => {
      mockElection = createMockElection([
        {
          title: 'Option 1',
          description: 'Description',
          image: 'https://example.com/image.png',
        },
        { title: 'Option 2' },
      ])

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              extendedInfo: true,
            }),
          })
        )
      })
    })

    it('should set extendedInfo to true when at least one choice has metadata', async () => {
      mockElection = createMockElection([
        { title: 'Option 1' }, // No metadata
        { title: 'Option 2', description: 'Has description' },
        { title: 'Option 3' }, // No metadata
      ])

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              extendedInfo: true,
            }),
          })
        )
      })
    })
  })

  describe('option metadata mapping', () => {
    it('should map option description when present (non-empty)', async () => {
      mockElection = createMockElection([{ title: 'Option 1', description: 'Test description' }])

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        const call = mockMutateAsync.mock.calls[0][0]
        expect(call.metadata.questions[0].options[0]).toEqual(
          expect.objectContaining({
            option: 'Option 1',
            description: 'Test description',
          })
        )
      })
    })

    it('should map option description as undefined when not present', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }]) // No description

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        const call = mockMutateAsync.mock.calls[0][0]
        expect(call.metadata.questions[0].options[0]).toEqual({
          option: 'Option 1',
          description: undefined,
          image: undefined,
        })
      })
    })

    it('should map option description as empty string when present but empty', async () => {
      mockElection = createMockElection([{ title: 'Option 1', description: '' }])

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        const call = mockMutateAsync.mock.calls[0][0]
        expect(call.metadata.questions[0].options[0].description).toBe('')
      })
    })

    it('should map option image when present with URL', async () => {
      mockElection = createMockElection([{ title: 'Option 1', image: 'https://example.com/image.png' }])

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        const call = mockMutateAsync.mock.calls[0][0]
        expect(call.metadata.questions[0].options[0]).toEqual(
          expect.objectContaining({
            option: 'Option 1',
            image: 'https://example.com/image.png',
          })
        )
      })
    })

    it('should map option image as undefined when metadata has no image', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }]) // No image at all

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        const call = mockMutateAsync.mock.calls[0][0]
        expect(call.metadata.questions[0].options[0].image).toBeUndefined()
      })
    })

    it('should map option image as empty string when present but empty', async () => {
      mockElection = createMockElection([{ title: 'Option 1', image: '' }])

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        const call = mockMutateAsync.mock.calls[0][0]
        expect(call.metadata.questions[0].options[0].image).toBe('')
      })
    })

    it('should correctly map options with different metadata combinations', async () => {
      mockElection = createMockElection([
        { title: 'Option 1', description: 'Desc 1', image: 'https://example.com/1.png' },
        { title: 'Option 2', description: 'Desc 2', image: '' },
        { title: 'Option 3', description: '', image: 'https://example.com/3.png' },
        { title: 'Option 4' }, // No metadata
      ])

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        const call = mockMutateAsync.mock.calls[0][0]
        const options = call.metadata.questions[0].options

        expect(options[0]).toEqual({
          option: 'Option 1',
          description: 'Desc 1',
          image: 'https://example.com/1.png',
        })

        expect(options[1]).toEqual({
          option: 'Option 2',
          description: 'Desc 2',
          image: '',
        })

        expect(options[2]).toEqual({
          option: 'Option 3',
          description: '',
          image: 'https://example.com/3.png',
        })

        expect(options[3]).toEqual({
          option: 'Option 4',
          description: undefined,
          image: undefined,
        })
      })
    })
  })

  describe('basic field mapping', () => {
    it('should map election title correctly', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }], { title: { default: 'Custom Election Title' } })

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              title: 'Custom Election Title',
            }),
          })
        )
      })
    })

    it('should map election description correctly', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }], { description: { default: 'Custom Description' } })

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              description: 'Custom Description',
            }),
          })
        )
      })
    })

    it('should pass the process orgAddress through as the draft owner', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }], { orgAddress: '0xabc123' })

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            orgAddress: '0xabc123',
          })
        )
      })
    })

    it('should map question title and description correctly', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }])

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              questions: [
                expect.objectContaining({
                  title: 'Test Question',
                  description: 'Question Description',
                }),
              ],
            }),
          })
        )
      })
    })

    it('should map multiple questions correctly', async () => {
      mockElection = createMockElection([{ title: 'Q1 Option 1' }])
      mockElection.questions = [
        createMockQuestion([{ title: 'Q1 Option 1' }], {
          id: 'question-1',
          title: { default: 'Question 1' },
          description: { default: 'Description 1' },
        }),
        createMockQuestion([{ title: 'Q2 Option 1' }], {
          id: 'question-2',
          title: { default: 'Question 2' },
          description: { default: 'Description 2' },
        }),
      ]

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        const call = mockMutateAsync.mock.calls[0][0]
        expect(call.metadata.questions).toHaveLength(2)
        expect(call.metadata.questions[0].title).toBe('Question 1')
        expect(call.metadata.questions[1].title).toBe('Question 2')
      })
    })

    it('should preserve weighted voting when cloning a weighted election', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }], { census: { weighted: true } })
      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              weightedVote: true,
            }),
          })
        )
      })
    })

    it('should preserve multi-choice settings and limits when cloning a multi-choice election', async () => {
      mockElection = createMockElection(
        [{ title: 'Option 1' }, { title: 'Option 2' }, { title: 'Option 3' }],
        {},
        {
          type: 'multiChoice',
          typeSetup: { minChoices: 0, maxChoices: 2, uniqueChoices: true },
          ballotProtocol: {
            costExponent: 1,
            costFromWeight: false,
            maxVoteOverwrites: 0,
            maxCount: 2,
            maxValue: 1,
            maxTotalCost: 2,
            uniqueValues: true,
          },
        }
      )
      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              questionType: 'multiChoice',
              minNumberOfChoices: 0,
              maxNumberOfChoices: 2,
            }),
          })
        )
      })
    })

    it('should preserve hidden results when any question is secret until the end', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }], {}, { secretUntilTheEnd: true })
      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              resultVisibility: 'hidden',
            }),
          })
        )
      })
    })
  })

  describe('success flow', () => {
    it('should show success toast on successful clone', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }])
      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Draft cloned successfully',
            type: 'success',
            duration: 3000,
            isClosable: true,
          })
        )
      })
    })

    it('should navigate to create page with draftId on success', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }])
      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.objectContaining({
            pathname: expect.stringContaining('/processes/create'),
            search: expect.any(String),
          }),
          { replace: true }
        )
      })
    })
  })

  describe('error flow', () => {
    it('should show error toast on mutation failure', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }])
      mockMutateAsync.mockRejectedValue(new Error('API Error'))
      mockPermission.mockReturnValue(5) // Limit of 5 drafts

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error cloning draft',
            description: expect.stringContaining('5 drafts'),
            type: 'error',
            duration: 10000,
            isClosable: true,
          })
        )
      })
    })

    it('should not navigate on mutation failure', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }])
      mockMutateAsync.mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled()
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should return early when the process has no questions', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }])
      mockElection.questions = []

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      expect(mockMutateAsync).not.toHaveBeenCalled()
    })

    it('should return early for null election', async () => {
      mockElection = null

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      expect(mockMutateAsync).not.toHaveBeenCalled()
    })

    it('should handle question metadata without a choices list', async () => {
      mockElection = createMockElection([{ title: 'Option 1' }], {}, { metadata: { someOtherProperty: 'value' } })

      mockMutateAsync.mockResolvedValue('draft-123')

      const { result } = renderHook(() => useCloneAsDraft())

      await act(async () => {
        await result.current.cloneAsDraft()
      })

      await waitFor(() => {
        const call = mockMutateAsync.mock.calls[0][0]
        expect(call.metadata.questions[0].options[0].image).toBeUndefined()
        expect(call.metadata.extendedInfo).toBe(false)
      })
    })
  })
})
