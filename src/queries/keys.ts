export const QueryKeys = {
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
  },
  census: {
    bundle: (censusURI?: string) => ['census', 'bundle', censusURI].filter(Boolean),
  },
  process: {
    participantsCheck: (bundleId?: string, processID?: string, fieldName?: string, value?: string) =>
      ['process', 'participantsCheck', bundleId, processID, fieldName, value].filter(Boolean),
  },
  plans: ['plans'],
  profile: ['profile'],
}
