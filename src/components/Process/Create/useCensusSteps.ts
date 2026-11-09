import { useFormContext, useFormState, useWatch } from 'react-hook-form'
import { CensusTypes } from '~components/Process/Census/CensusType'
import { Process } from './common'

export type StepStatus = 'idle' | 'current' | 'error' | 'done'

// The census is set up in two steps: pick a group, then set up how its voters
// authenticate. Every piece of census UI (the section badge, the step markers,
// the pending notice) reads its status from here, so they can't disagree.
export const useCensusSteps = () => {
  const { control } = useFormContext<Process>()
  const [groupId, census, censusType] = useWatch({ control, name: ['groupId', 'census', 'censusType'] })
  const { errors } = useFormState({ control, name: ['groupId', 'census'] })

  const required = censusType === CensusTypes.CSP
  const hasGroup = !!groupId
  const hasAuth = !!census

  const groupStatus = (): StepStatus => {
    if (hasGroup) return 'done'
    if (errors.groupId) return 'error'
    return 'idle'
  }

  const authStatus = (): StepStatus => {
    if (hasAuth) return 'done'
    if (!hasGroup) return 'idle'
    if (errors.census) return 'error'
    return 'current'
  }

  const stepsLeft = required ? Number(!hasGroup) + Number(!hasAuth) : 0

  return {
    required,
    groupStatus: groupStatus(),
    authStatus: authStatus(),
    stepsLeft,
    // A group is picked but its voters can't authenticate yet.
    isAuthPending: hasGroup && !hasAuth,
    hasAuthError: !!errors.census,
  }
}
