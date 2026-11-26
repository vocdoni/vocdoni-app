// Screens the UI snapshot renders; README.md ("Add a route") explains the fields. States are
// captured viewport-only on the route's own page, and a second state on one route reloads it first.
import {
  B_AAO_CANCELED,
  B_AAO_ENDED,
  B_AAO_LIVE,
  B_AAO_PAUSED,
  B_AAO_READY,
  B_QBQ_CANCELED,
  B_QBQ_CLOSED,
  B_QBQ_ENDED,
  B_QBQ_HELD,
  B_QBQ_LIVE,
  B_QBQ_MANY,
  B_QBQ_READY,
  HELD_STORAGE,
  P_BRAND_OFF,
  P_BRANDED,
  P_DRAFT,
  P_ENDED,
  P_ONGOING,
  P_QBQ,
  RELAY_PENDING,
  V_2FA,
  V_ANON,
  V_ANON_ENDED,
  V_ANON_SIGNED,
  V_CHECKING,
  V_LIVE,
  V_NOT_IN,
  V_QBQ_ANON_SIGNED,
  V_QBQ_BETWEEN,
  V_QBQ_ENDED,
  V_QBQ_HELD,
  V_QBQ_LIVE,
  V_QBQ_MANY,
  V_QBQ_READY,
  V_QBQ_RESULTS,
  V_QBQ_RESULTS_MISSED,
  V_QBQ_UPCOMING,
  V_QBQ_WEIGHTED,
  V_PAUSED,
  V_RESULTS,
  V_RESULTS_COUNTING,
  V_RESULTS_ENDED,
  V_RESULTS_SECRET,
  V_SECRET,
  V_VOTED,
  V_WEIGHTED,
  VOTER_LIVE_PAUSED,
  VOTER_MEMBER,
  VOTER_RESULTS_SECRET_REOPENED,
  VOTER_QBQ_MISSED,
  VOTER_QBQ_PAUSED,
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
// The question-by-question header said "End the vote" on the desktop until R33 made it "End now" at every width.
const endVote = {
  slug: 'end-confirm',
  open: [[named('button', 'End the vote|End now', 'Finalitza la votació|Finalitza ara')]],
}
const DRAFT_ROW = `article:has-text("New statutes") >> role=button[name=/^(More actions|Més accions)(: .+)?$/]`
const vote = (slug, id, states) => ({ slug, path: `/admin/process/${id}`, ...(states && { states }) })
const ballot = (slug, id) => ({ slug, path: `/admin/process/${id}/ballot` })

// The voter page (spec AC3): each state walks the flow from identify, through the screens' structural handles.
const onScreen = (kind, selector) => `[data-testid="voter-screen"][data-screen="${kind}"] ${selector}`
const IDENTIFY = [
  [['fill', 'input[name="memberNumber"]', VOTER_MEMBER]],
  [['css', '[data-scope="checkbox"][data-part="control"]']],
  [['css', onScreen('identify', 'button[type="submit"]')]],
]
const START = [...IDENTIFY, [['css', onScreen('welcome', '[data-scope="action-bar"] button')]]]
const CONTINUE = [['css', '[data-testid="voter-continue"]']]
const SINGLE = [...START, [['css', onScreen('question', 'label[data-choice-card]:has(input[value="0"])')]]]
const MULTIPLE = [...SINGLE, CONTINUE, [['css', '[id="question-1-choice-0-control"]']]]
const RANKED = [
  ...MULTIPLE,
  CONTINUE,
  [['css', onScreen('question', 'button[data-choice-value="0"]')]],
  [['css', onScreen('question', 'button[data-choice-value="1"]')]],
]
const REVIEW = [...RANKED, [['css', onScreen('question', 'button[data-choice-value="2"]')]], CONTINUE]
const CAST = [...REVIEW, [['css', '[data-testid="voter-cast"]']]]
// The results (boards V4VoterWideMore 9 to 11). The buttons are named in both languages the captures run in.
const SHOW_RESULTS = [['button', /^(Show the results|Mostra els resultats)$/]]
const CHECK_VOTE = [['button', /^(Check your vote|Comprova el teu vot)$/]]
// An ended secret vote: identify through "Comprova el teu vot", then the results while its tally is being counted.
const COUNTING = [CHECK_VOTE, ...IDENTIFY, SHOW_RESULTS]
// Anonymous censuses: "Verifica el teu comprovant" is a link on the closed screen and on the authorised-vote screen; the
// shortened code of the boards (14b) is not a whole code, so submitting it shows the error under the field.
// Question by question (boards V4VoterWideLive / M4VoterLive and the QbQ cases of V4VoterWideMore): identify, then the
// frame the open question decides. Captures with a cast need SDK #118 (plan Merge 0).
const QBQ_CHOOSE = [['css', onScreen('roomQuestion', 'label[data-choice-card]:has(input[value="0"])')]]
// The primary arms 800 ms after the question shows (VOTER_CAST_ARM_MS): a capture of the chosen ballot waits for it.
const QBQ_ARMED = [['wait', onScreen('roomQuestion', '[data-testid="voter-cast"]:not([aria-disabled])')]]
const QBQ_BACK = [['css', onScreen('roomQuestion', '[data-scope="action-bar"] button:not([data-testid])')]]
const QBQ_SKIP = [['button', /^(Do not vote on this question|No votar aquesta pregunta)$/]]
const SHOW_THEM = [['button', /^(Show them|Mostra-les)$/]]
const VERIFY_RECEIPT = [['css', '[data-testid="voter-verify-receipt"]']]
const SHORT_CODE = [['fill', 'input[name="code"]', 'a3f1\u20269c2e']]
const voter = (slug, id, states) => ({ slug, path: `/processes/${id}`, auth: false, ...(states && { states }) })

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
  { slug: 'process-ballot', path: `/admin/process/${P_ONGOING}/ballot` },
  // The Fil boards' states (mock-saas.mjs "board votes"), for the side-by-side checks.
  vote('vote-aao-ready', B_AAO_READY, [voteMenu, cancelVote]),
  vote('vote-aao-live', B_AAO_LIVE, [endNow, voteMenu, cancelVote]),
  vote('vote-aao-paused', B_AAO_PAUSED, [endNow]),
  vote('vote-aao-ended', B_AAO_ENDED, [voteMenu]),
  vote('vote-aao-canceled', B_AAO_CANCELED),
  vote('vote-qbq-ready', B_QBQ_READY, [cancelVote]),
  // A question-by-question vote is run from Gestió (R32): its row and bottom-bar buttons name the question after the
  // label, so they match on the label's start.
  vote('vote-qbq-live', B_QBQ_LIVE, [
    voteMenu,
    { slug: 'close-question', open: [[['button', /^(Close|Tanca): /]]] },
    { slug: 'expand-closed', open: [[['css', 'role=button[name=/^(Question|Pregunta) 1: /]']]] },
    endVote,
  ]),
  { ...vote('vote-qbq-held', B_QBQ_HELD), storage: HELD_STORAGE },
  vote('vote-qbq-closed', B_QBQ_CLOSED),
  vote('vote-qbq-ended', B_QBQ_ENDED),
  vote('vote-qbq-many', B_QBQ_MANY),
  vote('vote-qbq-canceled', B_QBQ_CANCELED),
  // Papereta: one that can still be canceled, one that can no longer be, and a question-by-question one.
  ballot('vote-aao-ballot', B_AAO_LIVE),
  ballot('vote-aao-ended-ballot', B_AAO_ENDED),
  ballot('vote-qbq-ballot', B_QBQ_LIVE),
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
      // The publish dialog over the valid draft; the mock's balance covers the price, so no card step.
      // No state presses a publish button: the wallet step is captured without pressing its pay button.
      { slug: 'publish-summary', open: [[['button', /^Publish$/]]] },
      {
        slug: 'publish-cost',
        open: [[['button', /^Publish$/]], [['button', /Review the details$/]]],
      },
      {
        slug: 'publish-wallet',
        open: [[['button', /^Publish$/]], [['css', '[data-primary="wallet"]']]],
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
  // Brand per vote: the add-on paints the organisation's logo and pale yellow; the same organisation without it keeps
  // the Vocdoni mark and Fil blue (vote-ongoing is the plain vote of the main organisation).
  { slug: 'vote-branded', path: `/processes/${P_BRANDED}`, auth: false },
  { slug: 'vote-brand-off', path: `/processes/${P_BRAND_OFF}`, auth: false },
  // The voter flow, one route per vote: the route itself is its first screen; run at 1440, 768 and 390 (README.md
  // "Voter flow").
  voter('voter-live', V_LIVE, [
    { slug: 'identify-mismatch', open: [[['fill', 'input[name="memberNumber"]', '0000']], ...IDENTIFY.slice(1)] },
    { slug: 'welcome', open: IDENTIFY },
    { slug: 'question-single', open: SINGLE },
    { slug: 'question-multiple', open: MULTIPLE },
    { slug: 'question-ranked', open: RANKED },
    { slug: 'review', open: REVIEW },
    { slug: 'receipt', open: CAST },
    // The organisation pauses the vote while the voter answers question 2: the next read says so.
    {
      slug: 'paused-mid-ballot',
      open: [...MULTIPLE, [['mock', `/processes/${V_LIVE}`, VOTER_LIVE_PAUSED]], [['refocus']]],
    },
  ]),
  { ...voter('voter-sending', V_LIVE, [{ slug: 'sending', open: CAST }]), mock: { '/jobs/job-relay': RELAY_PENDING } },
  voter('voter-secret', V_SECRET, [
    { slug: 'welcome', open: IDENTIFY },
    { slug: 'review-failed', open: CAST },
  ]),
  voter('voter-2fa', V_2FA, [
    {
      slug: 'code',
      open: [
        [['fill', 'input[name="memberNumber"]', VOTER_MEMBER]],
        [['fill', 'input[name="contact"]', 'anna@example.test']],
        ...IDENTIFY.slice(1),
      ],
    },
  ]),
  voter('voter-weighted', V_WEIGHTED, [{ slug: 'review-weighted', open: REVIEW }]),
  voter('voter-voted', V_VOTED, [{ slug: 'already-voted', open: IDENTIFY }]),
  voter('voter-not-in', V_NOT_IN, [{ slug: 'not-eligible', open: IDENTIFY }]),
  voter('voter-checking', V_CHECKING, [{ slug: 'checking', open: IDENTIFY }]),
  voter('voter-upcoming', B_AAO_READY),
  voter('voter-closed', B_AAO_ENDED),
  voter('voter-paused', V_PAUSED, [{ slug: 'paused', open: IDENTIFY }]),
  voter('voter-canceled', B_AAO_CANCELED),
  voter('voter-qbq-ready', V_QBQ_READY, [{ slug: 'not-started', open: IDENTIFY }]),
  voter('voter-qbq-live', V_QBQ_LIVE, [
    { slug: 'identify-mismatch', open: [[['fill', 'input[name="memberNumber"]', '0000']], ...IDENTIFY.slice(1)] },
    { slug: 'question', open: IDENTIFY },
    { slug: 'question-chosen', open: [...IDENTIFY, QBQ_CHOOSE, QBQ_ARMED] },
    { slug: 'room-open', open: [...IDENTIFY, QBQ_BACK] },
    { slug: 'skipped', open: [...IDENTIFY, QBQ_SKIP] },
    { slug: 'voted', open: [...IDENTIFY, QBQ_CHOOSE, [['css', '[data-testid="voter-cast"]']]] },
    {
      slug: 'missed',
      open: [
        ...IDENTIFY,
        [['mock', `/processes/${V_QBQ_LIVE}`, VOTER_QBQ_MISSED]],
        [['refocus']],
        [['wait', onScreen('roomMissed', 'h1')]],
      ],
    },
    {
      slug: 'paused-mid-ballot',
      open: [
        ...IDENTIFY,
        QBQ_CHOOSE,
        [['mock', `/processes/${V_QBQ_LIVE}`, VOTER_QBQ_PAUSED]],
        [['refocus']],
        [['wait', onScreen('roomQuestion', '[role="status"]')]],
      ],
    },
  ]),
  voter('voter-qbq-between', V_QBQ_BETWEEN, [{ slug: 'none-open', open: IDENTIFY }]),
  voter('voter-qbq-many', V_QBQ_MANY, [
    { slug: 'question', open: IDENTIFY, viewports: DESKTOP },
    { slug: 'room-open', open: [...IDENTIFY, QBQ_BACK] },
    { slug: 'unfolded', open: [...IDENTIFY, QBQ_BACK, SHOW_THEM, SHOW_THEM], viewports: DESKTOP },
  ]),
  voter('voter-qbq-weighted', V_QBQ_WEIGHTED, [
    { slug: 'question-weighted', open: [...IDENTIFY, QBQ_CHOOSE, QBQ_ARMED] },
  ]),
  voter('voter-qbq-paused', V_QBQ_HELD, [{ slug: 'paused', open: IDENTIFY }]),
  voter('voter-qbq-ended', V_QBQ_ENDED, [{ slug: 'already-voted', open: [CHECK_VOTE, ...IDENTIFY] }]),
  voter('voter-qbq-upcoming', V_QBQ_UPCOMING),
  // The result switch (R5): the question that just closed shows its tally, to a voter who voted it (3e) and to one who
  // did not (3d).
  voter('voter-qbq-results', V_QBQ_RESULTS, [{ slug: 'closed-voted', open: IDENTIFY }]),
  voter('voter-qbq-results-missed', V_QBQ_RESULTS_MISSED, [{ slug: 'missed-result', open: IDENTIFY }]),
  voter('voter-qbq-anon-signed', V_QBQ_ANON_SIGNED, [{ slug: 'authorised', open: IDENTIFY }]),
  // Anonymous censuses (boards V4VoterWideMore 12 to 14b): the receipt that must be kept (copy and download), a vote
  // signed from another device (no codes to show), and the verify page from the closed screen and from that vote.
  voter('voter-anon-cast', V_ANON, [{ slug: 'receipt', open: CAST }]),
  voter('voter-anon-signed', V_ANON_SIGNED, [
    { slug: 'authorised', open: IDENTIFY },
    { slug: 'verify', open: [...IDENTIFY, VERIFY_RECEIPT] },
  ]),
  voter('voter-anon-ended', V_ANON_ENDED, [
    { slug: 'verify', open: [VERIFY_RECEIPT] },
    {
      slug: 'verify-short-code',
      open: [VERIFY_RECEIPT, SHORT_CODE, [['css', onScreen('verifyReceipt', 'button[type="submit"]')]]],
    },
  ]),
  voter('voter-results', V_RESULTS, [{ slug: 'provisional', open: [[['css', '[data-testid="voter-show-results"]']]] }]),
  voter('voter-results-final', V_RESULTS_ENDED, [{ slug: 'final', open: [SHOW_RESULTS] }]),
  voter('voter-results-counting', V_RESULTS_COUNTING, [{ slug: 'counting', open: [SHOW_RESULTS] }]),
  voter('voter-results-secret', V_RESULTS_SECRET, [
    { slug: 'counting', open: COUNTING },
    // The organiser extends the vote: the next read says it is open and secret again (board M9).
    {
      slug: 'hidden',
      open: [...COUNTING, [['mock', `/processes/${V_RESULTS_SECRET}`, VOTER_RESULTS_SECRET_REOPENED]], [['refocus']]],
    },
  ]),
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
