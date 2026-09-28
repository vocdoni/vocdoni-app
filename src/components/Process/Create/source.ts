// Where the create-vote form was opened from, for the `process_create_started`
// funnel step. Passed as React Router location state, so it never shows up in
// the URL; landing on the form without it (typed URL, bookmark) reads `direct`.

export type ProcessCreateSource = 'menu' | 'dashboard' | 'empty_state' | 'memberbase' | 'drafts' | 'clone' | 'direct'

type ProcessCreateLinkState = { processCreateSource: ProcessCreateSource }

export const processCreateLinkState = (source: ProcessCreateSource): ProcessCreateLinkState => ({
  processCreateSource: source,
})

export const getProcessCreateSource = (state: unknown): ProcessCreateSource => {
  const source = (state as Partial<ProcessCreateLinkState> | null)?.processCreateSource
  return typeof source === 'string' ? source : 'direct'
}
