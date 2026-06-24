export const QueryKeys = {
  profile: ['profile'],
  integrator: {
    info: (address?: string) => ['integrator', 'info', address].filter(Boolean),
    managed: (address?: string) => ['integrator', 'managed', address].filter(Boolean),
  },
  organization: {
    info: (address?: string) => ['organization', 'info', address].filter(Boolean),
    types: ['organization', 'types'],
    roles: ['organization', 'roles'],
    users: (address?: string) => ['organization', 'users', address].filter(Boolean),
    pending: (address?: string) => ['organization', 'pending', address].filter(Boolean),
    apikeys: (address?: string) => ['organization', 'apikeys', address].filter(Boolean),
  },
  subscription: (address?: string) => ['subscription', address].filter(Boolean),
}
