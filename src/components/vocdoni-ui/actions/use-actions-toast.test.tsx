import { renderHook } from '@testing-library/react'
import { useActionsToast } from './use-actions-toast'

const toastFn = vi.fn(() => 'toast-id')
const closeFn = vi.fn()

let actionsState: { info: any; error: any } = {
  info: null,
  error: null,
}

vi.mock('@vocdoni/react-providers', () => ({
  useActions: () => actionsState,
  useElection: () => ({
    election: {
      title: { default: 'Test Election' },
    },
  }),
}))

vi.mock('~components/Toast', () => ({
  useToast: () => Object.assign(toastFn, { close: closeFn }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { election?: { title?: { default?: string } } }) => {
      const dict: Record<string, string> = {
        'actions.waiting_title': 'Waiting for confirmation',
        'actions.continue_description': 'Continuing "{{ election.title.default }}"',
        'actions.pause_description': 'Pausing "{{ election.title.default }}"',
      }
      const raw = dict[key] ?? key
      if (options?.election?.title?.default) {
        return raw.replace(/{{\s*election\.title\.default\s*}}/g, options.election.title.default)
      }
      return raw
    },
  }),
}))

describe('useActionsToast', () => {
  beforeEach(() => {
    toastFn.mockClear()
    closeFn.mockClear()
    actionsState = { info: null, error: null }
  })

  it('translates and interpolates action info toasts', () => {
    actionsState.info = {
      title: 'actions.waiting_title',
      description: 'actions.continue_description',
    }
    renderHook(() => useActionsToast())
    expect(toastFn).toHaveBeenCalledTimes(1)
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Waiting for confirmation',
        description: 'Continuing "Test Election"',
        type: 'info',
      })
    )
  })

  it('does not duplicate the same info toast', () => {
    actionsState.info = {
      title: 'actions.waiting_title',
      description: 'actions.pause_description',
    }
    const { rerender } = renderHook(() => useActionsToast())
    rerender()
    expect(toastFn).toHaveBeenCalledTimes(1)
  })
})
