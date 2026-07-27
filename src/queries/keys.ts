import { processQueryKeys } from '@vocdoni/react-components'

export const QueryKeys = {
  // Keys the @vocdoni/react-providers ElectionProvider and ProcessProvider read
  // through (shared cache namespace: process(id) / results(id)) — use these to
  // pre-seed or invalidate the process/results queries they observe.
  election: processQueryKeys,
  organization: {
    elections: (address?: string, params?: { page?: number; status?: string }) =>
      ['organizations', 'elections', address, params].filter(Boolean),
    info: (address?: string) => ['organizations', 'info', address].filter(Boolean),
    users: (address?: string) => ['organizations', 'users', address].filter(Boolean),
    names: ['organizations', 'names'],
    pendingUsers: (address?: string) => ['organizations', 'users', 'pending', address].filter(Boolean),
    roles: ['organizations', 'roles'],
    types: ['organizations', 'types'],
    subscription: (address?: string) => ['organizations', 'subscription', address].filter(Boolean),
    meta: (address?: string) => ['organizations', 'meta', address].filter(Boolean),
    members: (address?: string) => ['organizations', 'members', address].filter(Boolean),
    membersImportProgress: (address?: string, jobID?: string) =>
      ['organizations', 'members', address, 'importJobProgress', jobID].filter(Boolean),
    drafts: (address?: string) => ['organizations', 'drafts', address].filter(Boolean),
    groups: (address?: string) => ['organizations', 'groups', address].filter(Boolean),
    apikeys: (address?: string) => ['organizations', 'apikeys', address].filter(Boolean),
  },
  process: {
    participants: (processId?: string, field?: string, value?: string) =>
      ['process', 'participants', processId, field, value].filter(Boolean),
  },
  integrator: {
    info: (address?: string) => ['integrator', 'info', address].filter(Boolean),
    managed: (address?: string, page?: number, limit?: number) =>
      ['integrator', 'managed', address, page, limit].filter((v) => v !== undefined && v !== null),
  },
  plans: ['plans'],
  profile: ['profile'],
}
