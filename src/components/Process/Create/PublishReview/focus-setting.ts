import type { PublishEditTarget } from './summary-facts'

// The sidebar controls each summary row stands for. The end date and the two selects carry ids; the
// anonymity switch has none, so its hidden input is found by name (the handle the e2e suite uses too)
const settingSelectors: Record<Exclude<PublishEditTarget, 'auth'>, string> = {
  dates: '#endDate',
  weight: '#weightedVote',
  results: '#resultVisibility',
  anonymous: 'input[name="anonymousVoting"]',
}

// The dialog is still giving focus back to the Publish button as it unmounts, and the sidebar may
// have just been opened: try again a few times until the control has it
const attempts = [0, 120, 300, 600]

/**
 * Takes the user to a sidebar setting: scrolls it into view and focuses it. The sidebar must be open
 * (or opening) when this runs. Returns a cancel function.
 */
export const focusSetting = (target: Exclude<PublishEditTarget, 'auth'>) => {
  const timers: number[] = []
  const selector = settingSelectors[target]
  for (const delay of attempts) {
    timers.push(
      window.setTimeout(() => {
        const control = document.querySelector<HTMLElement>(selector)
        if (!control || document.activeElement === control) return
        control.scrollIntoView?.({ block: 'center' })
        control.focus({ preventScroll: true })
      }, delay)
    )
  }
  return () => timers.forEach((timer) => window.clearTimeout(timer))
}
