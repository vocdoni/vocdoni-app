import { generatePath, redirect, type LoaderFunctionArgs } from 'react-router'

const censusCheckoutReturnBase = '/admin/process/:id/census/checkout/return'

export const Routes = {
  root: '/',
  auth: {
    acceptInvite: '/account/invite',
    organizationCreate: '/account/create-organization', // Organization create with account layout
    signIn: '/account/signin',
    signUp: '/account/signup',
    recovery: '/account/password',
    verify: '/account/verify',
    passwordReset: '/account/password/reset',
  },
  contact: 'https://www.vocdoni.io/contact',
  integrators: {
    base: '/integrators', // Overview
    signIn: '/integrators/signin',
    signUp: '/integrators/signup',
    recovery: '/integrators/password',
    passwordReset: '/integrators/password/reset',
    // Sections landing in follow-up PRs (declared here so the nav config can reference them):
    managedOrganizations: '/integrators/organizations',
    apiKeys: '/integrators/api-keys',
    configuration: {
      base: '/integrators/configuration',
      billing: '/integrators/configuration/billing',
      support: '/integrators/configuration/support',
      // Stripe sends a redirect-based top-up back here, with the checkout session id appended
      billingReturn: '/integrators/configuration/billing/return/:sessionId',
      // Tabs that existed before billing; old links and emails still point at them
      legacySubscription: '/integrators/configuration/subscription',
      legacyWallet: '/integrators/configuration/wallet',
      legacyWalletReturn: '/integrators/configuration/wallet/return/:sessionId',
    },
  },
  dashboard: {
    base: '/admin',
    organization: '/admin/organization',
    organizationCreate: '/admin/organization/create', // Organization create with dashboard layout
    process: '/admin/process/:id',
    processResults: '/admin/process/:id/results',
    processes: {
      base: '/admin/processes',
      all: '/admin/processes/all/:page?/:status?',
      ended: '/admin/processes/ended/:page?/:status?',
      drafts: '/admin/processes/drafts/:page?',
    },
    profile: '/admin/profile',
    memberbase: {
      base: '/admin/memberbase',
      members: '/admin/memberbase/members/:page?',
      groups: '/admin/memberbase/groups',
    },
    census: {
      checkout: '/admin/process/:id/census/checkout',
      // Stripe appends the session id to the return URL
      checkoutReturnBase: censusCheckoutReturnBase,
      checkoutReturn: `${censusCheckoutReturnBase}/:sessionId`,
    },
    settings: {
      base: '/admin/settings',
      organization: '/admin/settings/organization',
      team: '/admin/settings/team',
      support: '/admin/settings/support',
      billing: '/admin/settings/billing',
      // Stripe sends a redirect-based top-up back here, with the checkout session id appended
      billingReturn: '/admin/settings/billing/return/:sessionId',
      // Tabs that existed before billing; old links and emails still point at them
      legacySubscription: '/admin/settings/subscription',
      legacyWallet: '/admin/settings/wallet',
      legacyWalletReturn: '/admin/settings/wallet/return/:sessionId',
    },
  },
  // Retired public page; /plans redirects to billing (signed in) or home
  plans: '/plans',
  organization: '/organization/:address',
  processes: {
    create: '/admin/processes/create/:groupId?',
    // Stripe sends a redirect-based top-up back here, with the checkout session id appended
    createReturn: '/admin/processes/create/return/:sessionId',
    view: '/processes/:id',
    summary: '/processes/:id/summary',
  },
  vocdoni: 'https://vocdoni.io',
}

// The tab a checkout return belongs to: `<tab>/return/<sessionId>` -> `<tab>`.
export const stripCheckoutReturn = (pathname: string) => pathname.replace(/\/return\/[^/]+\/?$/, '')

// A retired tab path redirects to its replacement, carrying over the params (a return URL's session id).
export const redirectLegacyPath = (to: string) => ({
  loader: ({ params }: LoaderFunctionArgs) => redirect(generatePath(to, params)),
})
