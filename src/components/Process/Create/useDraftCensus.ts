import { useFormContext, useWatch } from 'react-hook-form'
import { codeChannelsOf, useCensusFacts, useCodeBreakdown } from './census/useCensusFacts'
import type { Process } from './common'
import { useEditor } from './editor-context'

/**
 * The draft's census as Who can vote sees it, with how its people get their codes. Every caller
 * shares the same queries.
 */
export const useDraftCensus = () => {
  const { control } = useFormContext<Process>()
  const [groupId, census] = useWatch({ control, name: ['groupId', 'census'] })
  const { draft } = useEditor()
  const facts = useCensusFacts(groupId, draft?.id ?? null)
  const codes = useCodeBreakdown({
    groupId: facts.mode === 'everyone' ? undefined : groupId,
    channels: codeChannelsOf(census),
    total: facts.total,
    enabled: facts.totalKnown && (facts.mode === 'everyone' || facts.mode === 'owned' || facts.mode === 'pending'),
  })
  return { ...facts, codes }
}
