import { act, renderHook } from '@testing-library/react'
import type { FieldErrors } from 'react-hook-form'
import { Process } from './common'
import { CENSUS_SETUP_TOAST_ID, useCensusSetupToast } from './useCensusSetupToast'
import { useVoterAuthDialog, VoterAuthDialogProvider } from './VoterAuthentication/VoterAuthDialogContext'

const mockToast = vi.fn()

vi.mock('~components/Toast', () => ({
  useToast: () => mockToast,
}))

const required = { type: 'required', message: 'required' }

const renderToastHook = () =>
  renderHook(() => ({ showToast: useCensusSetupToast(), dialog: useVoterAuthDialog() }), {
    wrapper: VoterAuthDialogProvider,
  })

describe('useCensusSetupToast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('stays quiet when the census is not what blocked the publish', () => {
    const { result } = renderToastHook()

    result.current.showToast({ title: required } as FieldErrors<Process>)

    expect(mockToast).not.toHaveBeenCalled()
  })

  it('asks for a group first when none is picked', () => {
    const { result } = renderToastHook()

    // Without a group the census is missing too, but the group is what comes first.
    result.current.showToast({ groupId: required, census: required } as FieldErrors<Process>)

    expect(mockToast).toHaveBeenCalledTimes(1)
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ id: CENSUS_SETUP_TOAST_ID, type: 'error', title: 'Choose who can vote' })
    )
    // There is nothing to set up authentication for yet.
    expect(mockToast.mock.calls[0][0].action).toBeUndefined()
  })

  it('offers to open the voter authentication dialog when only that is missing', () => {
    const { result } = renderToastHook()

    result.current.showToast({ census: required } as FieldErrors<Process>)

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        id: CENSUS_SETUP_TOAST_ID,
        type: 'error',
        title: "Voter authentication isn't set up",
        action: expect.objectContaining({ label: 'Set it up' }),
      })
    )

    expect(result.current.dialog.open).toBe(false)
    act(() => mockToast.mock.calls[0][0].action.onClick())
    expect(result.current.dialog.open).toBe(true)
  })

  // The toaster merges an update into the visible toast with the same id, so a
  // field the new variant leaves out would survive from the old one.
  it('drops the "Set it up" action when the group-missing toast replaces the auth one', () => {
    const shown = new Map<string, Record<string, unknown>>()
    mockToast.mockImplementation((options) => shown.set(options.id, { ...shown.get(options.id), ...options }))
    const { result } = renderToastHook()

    result.current.showToast({ census: required } as FieldErrors<Process>)
    result.current.showToast({ groupId: required, census: required } as FieldErrors<Process>)

    const toast = shown.get(CENSUS_SETUP_TOAST_ID)
    expect(toast?.title).toBe('Choose who can vote')
    expect(toast?.action).toBeUndefined()
  })
})
