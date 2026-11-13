// Kept apart from SharedCensus so the home route can read PROCESS_IDS without loading the
// editor and player that page pulls in.
export const parseProcessIds = (value: string | undefined) =>
  (value || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
