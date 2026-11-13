// Screens the UI snapshot renders; README.md ("Add a route") explains the fields. States are
// captured viewport-only on the route's own page, and a second state on one route reloads it first.
import { P_DRAFT, P_ENDED, P_ONGOING } from './mock-saas.mjs'

// At phone width these triggers sit behind a drawer or menu, so their states are desktop only.
const DESKTOP = [1440]

export const ROUTES = [
  {
    slug: 'dashboard',
    path: '/admin',
    states: [{ slug: 'user-menu', open: [[['button', /^User menu$/]]], viewports: DESKTOP }],
  },
  { slug: 'processes-all', path: '/admin/processes/all' },
  { slug: 'processes-ended', path: '/admin/processes/ended' },
  { slug: 'processes-drafts', path: '/admin/processes/drafts' },
  {
    slug: 'process-ongoing',
    path: `/admin/process/${P_ONGOING}`,
    states: [{ slug: 'end-vote-confirm', open: [[['button', /^End voting$/i]]], viewports: DESKTOP }],
  },
  { slug: 'process-results', path: `/admin/process/${P_ENDED}/results` },
  {
    slug: 'create-empty',
    path: '/admin/processes/create',
    states: [{ slug: 'publish-errors', open: [[['button', /^Publish$/]]] }],
  },
  {
    slug: 'create-draft',
    path: `/admin/processes/create?draftId=${P_DRAFT}`,
    states: [
      {
        slug: 'voter-auth-dialog',
        open: [[['button', /^(Configure|Edit) Voter Authentication$/i]]],
        viewports: DESKTOP,
      },
    ],
  },
  {
    slug: 'memberbase-members',
    path: '/admin/memberbase/members',
    states: [{ slug: 'add-member', open: [[['button', /^Add member$/i]]] }],
  },
  {
    slug: 'memberbase-groups',
    path: '/admin/memberbase/groups',
    states: [{ slug: 'group-menu', open: [[['button', /^More options$/]]] }],
  },
  { slug: 'settings-organization', path: '/admin/settings/organization' },
  {
    slug: 'settings-team',
    path: '/admin/settings/team',
    states: [{ slug: 'invite', open: [[['button', /^Add team member$/]]] }],
  },
  { slug: 'settings-billing', path: '/admin/settings/billing' },
  { slug: 'settings-support', path: '/admin/settings/support' },
  { slug: 'profile', path: '/admin/profile' },
  { slug: 'organization-create', path: '/admin/organization/create' },
  { slug: 'signin', path: '/account/signin', auth: false },
  { slug: 'signup', path: '/account/signup', auth: false },
  { slug: 'vote-ongoing', path: `/processes/${P_ONGOING}`, auth: false },
  { slug: 'vote-results', path: `/processes/${P_ENDED}`, auth: false },
]

export const DEFAULT_VIEWPORTS = [1440, 390]
export const DEFAULT_MODES = ['light', 'dark']

// The states a route captures at one viewport: a state with `viewports` runs only at the widths it lists.
export const statesAt = (route, width) =>
  (route.states || []).filter((state) => !state.viewports || state.viewports.includes(width))

// The file name of a capture, shared by snapshot.mjs and captureNames: the route, or one of its states.
export const captureName = (route, width, mode, state) =>
  state ? `${route.slug}--${state.slug}-${width}-${mode}` : `${route.slug}-${width}-${mode}`

// The file names of a run over these routes, as snapshot.mjs writes them: each state only at the viewports it lists.
export const captureNames = ({ routes = ROUTES, viewports, modes }) =>
  routes.flatMap((route) =>
    viewports.flatMap((width) =>
      modes.flatMap((mode) => [
        captureName(route, width, mode),
        ...statesAt(route, width).map((state) => captureName(route, width, mode, state)),
      ])
    )
  )
