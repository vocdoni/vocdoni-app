// Screens the UI snapshot renders; README.md ("Add a route") explains the fields. States are
// captured viewport-only on the route's own page, and a second state on one route reloads it first.
import {
  B_AAO_CANCELED,
  B_AAO_ENDED,
  B_AAO_LIVE,
  B_AAO_PAUSED,
  B_AAO_READY,
  B_QBQ_CLOSED,
  B_QBQ_ENDED,
  B_QBQ_HELD,
  B_QBQ_LIVE,
  B_QBQ_MANY,
  B_QBQ_READY,
  B_QBQ_TWO,
  HELD_STORAGE,
  P_DRAFT,
  P_ENDED,
  P_ONGOING,
  P_QBQ,
} from './mock-saas.mjs'

// At phone width these triggers sit behind a drawer or menu, so their states are desktop only.
const DESKTOP = [1440]
// Below `lg` the dashboard's navigation is a drawer opened from the top bar; from `lg` it is the sidebar.
const BELOW_LG = [768, 390]

// Triggers named in English and in Catalan, so a `--lang ca` run opens the same states as the boards.
const named = (role, en, ca) => [role, new RegExp(`^(${en}|${ca})$`)]
const MORE = [named('button', 'More', 'Més'), named('button', 'More actions', 'Més accions')]
const voteMenu = { slug: 'vote-menu', open: [MORE] }
const cancelVote = {
  slug: 'cancel-confirm',
  open: [
    MORE,
    [
      named('menuitem', 'Cancel the vote', 'Cancel·la la votació'),
      named('button', 'Cancel the vote', 'Cancel·la la votació'),
    ],
  ],
}
const endNow = { slug: 'end-confirm', open: [[named('button', 'End now', 'Finalitza ara')]] }
const endVote = { slug: 'end-confirm', open: [[named('button', 'End the vote', 'Finalitza la votació')]] }
const DRAFT_ROW = `article:has-text("New statutes") >> role=button[name=/^(More actions|Més accions)$/]`
const vote = (slug, id, states) => ({ slug, path: `/admin/process/${id}`, ...(states && { states }) })
const manage = (slug, id, states) => ({ slug, path: `/admin/process/${id}/manage`, ...(states && { states }) })

export const ROUTES = [
  {
    slug: 'dashboard',
    path: '/admin',
    states: [
      { slug: 'user-menu', open: [[['css', '[data-scope="popover"][data-part="trigger"]']]], viewports: DESKTOP },
      { slug: 'nav-drawer', open: [[['button', /^Open menu$/i]]], viewports: BELOW_LG },
    ],
  },
  {
    slug: 'processes-all',
    path: '/admin/processes/all',
    states: [
      { slug: 'row-menu', open: [[['css', DRAFT_ROW]]] },
      {
        slug: 'delete-draft',
        open: [[['css', DRAFT_ROW]], [named('menuitem', 'Delete', 'Elimina'), named('button', 'Delete', 'Elimina')]],
      },
    ],
  },
  {
    slug: 'processes-empty',
    path: '/admin/processes/all',
    mock: { '/processes': { processes: [], pagination: { totalItems: 0, currentPage: 1, lastPage: 1 } } },
  },
  { slug: 'processes-live', path: '/admin/processes/live' },
  { slug: 'processes-ended', path: '/admin/processes/ended' },
  { slug: 'processes-drafts', path: '/admin/processes/drafts' },
  {
    slug: 'process-ongoing',
    path: `/admin/process/${P_ONGOING}`,
    states: [{ slug: 'end-vote-confirm', open: [[['button', /^End now$/i]]], viewports: DESKTOP }],
  },
  { slug: 'process-qbq', path: `/admin/process/${P_QBQ}` },
  { slug: 'process-manage', path: `/admin/process/${P_QBQ}/manage` },
  { slug: 'process-ballot', path: `/admin/process/${P_ONGOING}/ballot` },
  // The Fil boards' states (mock-saas.mjs "board votes"), for the side-by-side checks.
  vote('vote-aao-ready', B_AAO_READY, [voteMenu, cancelVote]),
  vote('vote-aao-live', B_AAO_LIVE, [endNow, voteMenu, cancelVote]),
  vote('vote-aao-paused', B_AAO_PAUSED, [endNow]),
  vote('vote-aao-ended', B_AAO_ENDED, [voteMenu]),
  vote('vote-aao-canceled', B_AAO_CANCELED),
  vote('vote-qbq-ready', B_QBQ_READY, [cancelVote]),
  manage('manage-qbq-ready', B_QBQ_READY),
  vote('vote-qbq-live', B_QBQ_LIVE, [voteMenu]),
  manage('manage-qbq-live', B_QBQ_LIVE, [
    { slug: 'close-question', open: [[named('button', 'Close', 'Tanca')]] },
    { slug: 'expand-closed', open: [[['css', 'role=button[name=/^(Question|Pregunta) 1: /]']]] },
    endVote,
  ]),
  manage('manage-qbq-two', B_QBQ_TWO, [endVote]),
  { ...vote('vote-qbq-held', B_QBQ_HELD), storage: HELD_STORAGE },
  { ...manage('manage-qbq-held', B_QBQ_HELD), storage: HELD_STORAGE },
  vote('vote-qbq-closed', B_QBQ_CLOSED),
  manage('manage-qbq-closed', B_QBQ_CLOSED),
  vote('vote-qbq-ended', B_QBQ_ENDED),
  manage('manage-qbq-ended', B_QBQ_ENDED),
  vote('vote-qbq-many', B_QBQ_MANY),
  manage('manage-qbq-many', B_QBQ_MANY),
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
