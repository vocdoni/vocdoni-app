// Screens the UI snapshot renders. See README.md ("Add a route").
//
// - slug:   output file prefix, also the name used by `--routes`.
// - path:   app path without the language; the snapshot opens /en<path>.
// - auth:   false renders the page logged out. Logged-in pages get a fake token in localStorage.
// - states: optional overlays (dialogs, menus, validation) captured after the route itself, on the
//           same page; a second state on one route reloads it first. `open` is a list of steps;
//           each step clicks the first VISIBLE match of its candidates, tried in order:
//           [role, accessible name] or ['css', selector]. The state is captured viewport-only.
//           `viewports` limits a state to some widths (default: every width of the run).
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
  {
    slug: 'settings-subscription',
    path: '/admin/settings/subscription',
    states: [{ slug: 'contact-dialog', open: [[['button', /^Contact us$/]]] }],
  },
  { slug: 'settings-support', path: '/admin/settings/support' },
  { slug: 'profile', path: '/admin/profile' },
  { slug: 'plans-loggedin', path: '/plans' },
  { slug: 'organization-create', path: '/admin/organization/create' },
  { slug: 'signin', path: '/account/signin', auth: false },
  { slug: 'signup', path: '/account/signup', auth: false },
  { slug: 'plans-public', path: '/plans', auth: false },
  { slug: 'vote-ongoing', path: `/processes/${P_ONGOING}`, auth: false },
  { slug: 'vote-results', path: `/processes/${P_ENDED}`, auth: false },
]
