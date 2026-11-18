// Dependency-free fake of the Vocdoni SaaS API for the offline UI snapshot (see README.md).
// Standalone: node scripts/ui-snapshot/mock-saas.mjs [port]   (logs every request to stdout)
import http from 'node:http'
import { pathToFileURL } from 'node:url'

export const MOCK_HOST = '127.0.0.1'
export const MOCK_PORT = 3999

// The browser clock is frozen here (page.clock.setFixedTime). It sits inside the ongoing vote.
export const FIXED_NOW = Date.UTC(2026, 5, 15, 10, 0, 0)

export const ORG = '0x7e57c0de00000000000000000000000000a11ce5'
export const P_DRAFT = '650000000000000000000d01'
export const P_ONGOING = '650000000000000000000a01'
export const P_ENDED = '650000000000000000000e01'
export const P_QBQ = '650000000000000000000b01'
// The Fil boards' votes, with the boards' data, for the side-by-side checks (README.md "Board states").
export const B_AAO_READY = '650000000000000000000a12'
export const B_AAO_LIVE = '650000000000000000000a11'
export const B_AAO_PAUSED = '650000000000000000000a13'
export const B_AAO_ENDED = '650000000000000000000a14'
export const B_AAO_CANCELED = '650000000000000000000c11'
export const B_QBQ_READY = '650000000000000000000b16'
export const B_QBQ_LIVE = '650000000000000000000b11'
export const B_QBQ_HELD = '650000000000000000000b13'
export const B_QBQ_CLOSED = '650000000000000000000b14'
export const B_QBQ_ENDED = '650000000000000000000b15'
export const B_QBQ_MANY = '650000000000000000000b17'
export const B_QBQ_CANCELED = '650000000000000000000c12'
// Brand per vote: a vote of another organisation with the branding add-on, and one of the same organisation without it.
export const BRAND_ORG = '0xb2a4d000000000000000000000000000000f00d1'
export const P_BRANDED = '650000000000000000000f01'
export const P_BRAND_OFF = '650000000000000000000f02'
// The voter page's states (spec AC3), reached by id only: see "voter flow votes" below.
export const V_LIVE = '650000000000000000001001'
export const V_SECRET = '650000000000000000001002'
export const V_2FA = '650000000000000000001003'
export const V_WEIGHTED = '650000000000000000001004'
export const V_VOTED = '650000000000000000001005'
export const V_NOT_IN = '650000000000000000001006'
export const V_CHECKING = '650000000000000000001007'
export const V_PAUSED = '650000000000000000001008'
export const V_RESULTS = '650000000000000000001009'
export const V_RESULTS_ENDED = '65000000000000000000100a'
export const V_RESULTS_SECRET = '65000000000000000000100b'
/** The member number the voter votes' auth-only censuses answer; any other one is not in the census. */
export const VOTER_MEMBER = 'A-1001'
export const FAKE_TOKEN = 'fake-local-token'
export const TOKEN_EXPIRY = '2031-01-01T00:00:00.000Z'

const ORG_NOPFX = ORG.slice(2)
const iso = (s) => new Date(s).toISOString()
const ml = (s) => ({ default: s })
const pagination = (n) => ({ totalItems: n, previousPage: null, currentPage: 1, nextPage: null, lastPage: 1 })

// ---- plans --------------------------------------------------------------------------------
// Prices are in cents, like the real API (the app divides by 100 when it formats them).
const plan = (id, name, monthly, yearly, extra = {}) => ({
  id,
  name,
  stripeID: `price_fake_${id}`,
  monthlyPrice: monthly,
  yearlyPrice: yearly,
  default: id === 'free',
  freeTrialDays: 0,
  organization: {
    teamMembers: extra.team ?? 1,
    subOrgs: 0,
    censusSize: extra.census ?? 100,
    maxProcesses: extra.procs ?? 3,
    maxCensus: extra.census ?? 100,
    maxDuration: '30d',
    customURL: !!extra.pro,
    drafts: extra.drafts ?? 3,
  },
  votingTypes: {
    single: true,
    multiple: true,
    approval: true,
    cumulative: !!extra.pro,
    ranked: !!extra.pro,
    weighted: !!extra.pro,
  },
  features: {
    anonymous: true,
    overwrite: true,
    liveResults: true,
    personalization: !!extra.pro,
    emailReminder: !!extra.pro,
    '2FAsms': extra.pro ? 1000 : 0,
    '2FAemail': extra.pro ? 10000 : 100,
    whiteLabel: !!extra.pro,
    liveStreaming: !!extra.pro,
    phoneSupport: !!extra.pro,
  },
})
const PLANS = [
  plan('free', 'Free', 0, 0),
  plan('starter', 'Starter', 4900, 49000, { team: 3, census: 500, procs: 10, drafts: 10 }),
  plan('professional', 'Professional', 19900, 199000, { team: 10, census: 5000, procs: 100, drafts: 50, pro: true }),
]
const PLAN = PLANS[2]

const SUB_DETAILS = {
  planId: PLAN.id,
  startDate: '2026-03-01T00:00:00.000Z',
  endDate: '2031-03-01T00:00:00.000Z',
  renewalDate: '2031-03-01T00:00:00.000Z',
  lastPaymentDate: '2026-03-01T00:00:00.000Z',
  active: true,
  maxCensusSize: 5000,
  email: 'billing@example.test',
}
const USAGE = { processes: 3, sentEmails: 214, sentSMS: 12, sentVotes: 87, subOrgs: 0, users: 3 }

// ---- organization -------------------------------------------------------------------------
const ORGANIZATION = {
  address: ORG,
  name: ml('Fictional Neighbours Association'),
  description: ml('A made-up residents association used to render the dashboard locally.'),
  logo: ml(''),
  website: 'https://example.test',
  color: '#3355aa',
  size: '50-100',
  type: 'association',
  country: 'ES',
  timezone: 'Europe/Madrid',
  subdomain: 'fictional-neighbours',
  communications: false,
  integrator: false,
  createdAt: '2026-01-10T09:00:00.000Z',
  defaultLang: 'en',
  meta: {},
  counters: USAGE,
  subscription: SUB_DETAILS,
}

// The organisation behind the branded votes. Its colour is a pale yellow on purpose, so the captures show the contrast
// fallbacks (a darker solid step, black labels, a hover that lightens). The logo is inline, so no request leaves.
const BRAND_LOGO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><rect width="40" height="40" rx="8" fill="#1f2937"/>' +
    '<circle cx="20" cy="20" r="10" fill="#f5d90a"/><rect x="52" y="12" width="100" height="16" rx="4" fill="#1f2937"/></svg>'
)}`
const BRAND_ORGANIZATION = {
  ...ORGANIZATION,
  address: BRAND_ORG,
  name: ml('Fictional Cooperative of the Plain'),
  description: ml('A made-up cooperative that pays for the branding add-on.'),
  logo: ml(BRAND_LOGO),
  color: '#f5d90a',
  subdomain: 'fictional-cooperative',
}
// Any address answers with the main organisation, except the branded one.
const organizationFor = (address) =>
  address.toLowerCase().replace(/^0x/, '') === BRAND_ORG.slice(2) ? BRAND_ORGANIZATION : ORGANIZATION

const USER = {
  id: 'u-0001',
  email: 'ada.admin@example.test',
  firstName: 'Ada',
  lastName: 'Testwell',
  providers: [],
  hasPassword: true,
  organizations: [
    {
      role: 'admin',
      isIntegrator: false,
      organization: {
        address: ORG,
        type: 'association',
        size: 50,
        color: '#3355aa',
        logo: '',
        subdomain: 'fictional-neighbours',
        timezone: 'Europe/Madrid',
        active: true,
        subscription: SUB_DETAILS,
      },
    },
  ],
}

// ---- members & groups ---------------------------------------------------------------------
const FIRST = ['Marta', 'Jordi', 'Lucía', 'Pau', 'Nora', 'Iker', 'Sofia', 'Arnau', 'Elena', 'Bruno']
const LAST = ['Fake', 'Sample', 'Mockson', 'Demo', 'Placeholder', 'Testa', 'Dummy', 'Example', 'Pretend', 'Notreal']
const MEMBERS = FIRST.map((f, i) => ({
  id: `m${String(i + 1).padStart(23, '0')}`,
  memberNumber: `A-${1001 + i}`,
  name: f,
  surname: LAST[i],
  email: `${f
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z]/g, '')}@example.test`,
  phone: `+3460000${String(1000 + i)}`,
  nationalId: `0000${i}${i}${i}X`,
  birthDate: `19${70 + i}-0${(i % 9) + 1}-1${i}`,
  weight: i === 0 ? 2 : 1,
}))
const GROUPS = [
  {
    id: 'g00000000000000000000001',
    title: 'All members',
    description: 'Everyone in the member base',
    createdAt: '2026-04-16T09:00:00.000Z',
    updatedAt: '2026-06-13T09:00:00.000Z',
    censusIds: ['c1'],
    memberIds: MEMBERS.map((m) => m.id),
    membersCount: MEMBERS.length,
    isAutoGroup: true,
  },
  {
    id: 'g00000000000000000000002',
    title: 'Board',
    description: 'Board of directors',
    createdAt: '2026-05-16T09:00:00.000Z',
    updatedAt: '2026-06-10T09:00:00.000Z',
    censusIds: [],
    memberIds: MEMBERS.slice(0, 4).map((m) => m.id),
    membersCount: 4,
    isAutoGroup: false,
  },
]

// ---- processes ----------------------------------------------------------------------------
// Vote dates sit far from FIXED_NOW on purpose: the public SSR pages are rendered with the real
// clock (see README.md "Known limits"), and both clocks must agree on whether a vote is ongoing.
const hex64 = (seed) => seed.repeat(64).slice(0, 64)
const ballot = (n) => ({
  maxCount: 1,
  maxValue: n - 1,
  maxVoteOverwrites: 0,
  costExponent: 1,
  uniqueValues: false,
  maxTotalCost: 0,
  costFromWeight: false,
})
const question = (pid, idx, title, choices, status, results) => ({
  id: `${pid.slice(0, 20)}q00${idx}`,
  parentProcessId: pid,
  upstreamId: hex64(String.fromCharCode(97 + idx) + pid.slice(-3)),
  title: ml(title),
  description: ml(`Fake description for "${title}".`),
  choices: choices.map((c, v) => ({ title: ml(c), value: v })),
  ballotProtocol: ballot(choices.length),
  type: 'singlechoice',
  typeSetup: { maxChoices: 1, minChoices: 1, uniqueChoices: false },
  secretUntilTheEnd: false,
  status,
  metadata: {},
  ...(results ? { results } : {}),
})
const census = {
  groupId: GROUPS[0].id,
  authFields: ['memberNumber'],
  twoFaFields: ['email'],
  weighted: false,
  anonymous: false,
  size: 10,
  totalWeight: 10,
}

const PROCESSES = [
  {
    id: P_ONGOING,
    orgAddress: ORG_NOPFX,
    chainId: 'vocdoni/DEV/fake',
    title: ml('Annual budget 2027'),
    description: ml('Vote on the proposed annual budget and the new board seat. Everything here is fake.'),
    header: '',
    census,
    published: true,
    startDate: '2026-06-01T08:00:00.000Z',
    endDate: '2030-12-31T20:00:00.000Z',
    createdAt: '2026-05-30T08:00:00.000Z',
    questions: [
      question(P_ONGOING, 1, 'Do you approve the 2027 budget?', ['Yes', 'No', 'Abstain'], 'ONGOING', {
        voteCount: 6,
        maxVoters: 10,
        finalResults: false,
        results: [['4', '1', '1']],
      }),
      question(
        P_ONGOING,
        2,
        'Who should fill the open board seat?',
        ['Marta Fake', 'Jordi Sample', 'Lucía Mockson'],
        'ONGOING',
        {
          voteCount: 6,
          maxVoters: 10,
          finalResults: false,
          results: [['3', '2', '1']],
        }
      ),
    ],
  },
  {
    id: P_ENDED,
    orgAddress: ORG_NOPFX,
    chainId: 'vocdoni/DEV/fake',
    title: ml('Summer party location'),
    description: ml('Pick where the summer party happens. Fake data.'),
    header: '',
    census,
    published: true,
    startDate: '2026-03-01T08:00:00.000Z',
    endDate: '2026-03-15T20:00:00.000Z',
    createdAt: '2026-02-27T08:00:00.000Z',
    questions: [
      question(P_ENDED, 1, 'Where should the party be?', ['Beach', 'Park', 'Community hall'], 'RESULTS', {
        voteCount: 9,
        maxVoters: 10,
        finalResults: true,
        results: [['5', '3', '1']],
      }),
      question(P_ENDED, 2, 'Which month?', ['June', 'July', 'August'], 'RESULTS', {
        voteCount: 9,
        maxVoters: 10,
        finalResults: true,
        results: [['2', '6', '1']],
      }),
    ],
  },
  {
    // Question by question (initialStatus PAUSED): one question closed with a result, one open, one still to open.
    id: P_QBQ,
    orgAddress: ORG_NOPFX,
    chainId: 'vocdoni/DEV/fake',
    title: ml('Autumn general assembly'),
    description: ml('An assembly voted question by question. Everything here is fake.'),
    header: '',
    census,
    published: true,
    initialStatus: 'PAUSED',
    startDate: '2026-06-01T08:00:00.000Z',
    endDate: '2030-12-31T20:00:00.000Z',
    createdAt: '2026-05-29T08:00:00.000Z',
    questions: [
      {
        ...question(P_QBQ, 1, 'Approve the minutes of the last assembly?', ['Yes', 'No'], 'RESULTS', {
          voteCount: 8,
          maxVoters: 10,
          finalResults: true,
          results: [['7', '1']],
        }),
        endedAt: '2026-06-01T08:20:00.000Z',
      },
      question(P_QBQ, 2, 'Raise the yearly fee to 48 EUR?', ['Yes', 'No', 'Abstain'], 'ONGOING', {
        voteCount: 6,
        maxVoters: 10,
        finalResults: false,
        results: [['4', '1', '1']],
      }),
      question(P_QBQ, 3, 'Elect two board members', ['Marta Fake', 'Jordi Sample', 'Lucía Mockson'], 'PAUSED', {
        voteCount: 0,
        maxVoters: 10,
        finalResults: false,
        results: [['0', '0', '0']],
      }),
    ],
  },
  {
    id: P_DRAFT,
    orgAddress: ORG_NOPFX,
    title: ml('New statutes (draft)'),
    description: ml('Draft of the vote on the new statutes.'),
    header: '',
    census,
    published: false,
    startDate: '2031-01-10T08:00:00.000Z',
    endDate: '2031-01-17T20:00:00.000Z',
    createdAt: '2026-06-14T08:00:00.000Z',
    updatedAt: '2026-06-14T08:00:00.000Z',
    questions: [
      question(P_DRAFT, 1, 'Approve the new statutes?', ['Yes', 'No'], 'UPCOMING'),
      question(P_DRAFT, 2, 'Apply them from January?', ['Yes', 'No'], 'UPCOMING'),
    ],
  },
]
// ---- board votes --------------------------------------------------------------------------
// The votes of the Fil boards (Catalan titles, a census of 312, the boards' tallies), dated around FIXED_NOW. The
// list shows the ready, paused and canceled ones; the other states are reached by their id only (`unlisted`).
const BOARD_CENSUS = { ...census, size: 312, totalWeight: 312 }
const FOR = ['A favor', 'En contra', 'Abstenció']
const tally = (votes, final) => ({
  voteCount: votes.reduce((sum, n) => sum + n, 0),
  maxVoters: 312,
  finalResults: final,
  results: [votes.map(String)],
})
const at = (time) => `2026-06-15T${time}Z`
const boardVote = (id, title, extra) => ({
  id,
  orgAddress: ORG_NOPFX,
  chainId: 'vocdoni/DEV/fake',
  title: ml(title),
  description: ml(''),
  header: '',
  census: BOARD_CENSUS,
  published: true,
  createdAt: '2026-05-20T08:00:00.000Z',
  ...extra,
})

// Question by question: the short title is the question's title, the full question its description.
const QBQ = [
  ["Acta de l'assemblea anterior", "Aprovem l'acta de l'assemblea anterior?", [198, 7, 9]],
  ["Memòria d'activitats", "Aprovem la memòria d'activitats de 2026?", [201, 12, 8]],
  ['Quotes 2027', "Apugem la quota a 48 EUR l'any el 2027?", [126, 38, 8]],
  ['Elecció de dues vocalies', 'Ratifiquem les dues vocalies proposades?', [20, 2, 1]],
]
// Unique per vote (the older fixtures share one id prefix).
const boardQuestionId = (pid, idx) => `${pid}q${String(idx).padStart(2, '0')}`
const qbqQuestion = (pid, idx, [short, full, votes], status, { voted, ...extra } = {}) => {
  const final = status === 'RESULTS' || status === 'ENDED'
  const counted = status === 'PAUSED' && !voted ? votes.map(() => 0) : votes
  return {
    ...question(pid, idx, short, FOR, status, tally(counted, final)),
    id: boardQuestionId(pid, idx),
    description: ml(full),
    secretUntilTheEnd: true,
    ...extra,
  }
}
const qbqVote = (id, statuses, extra = {}, list = QBQ) =>
  boardVote(id, 'Assemblea General de tardor', {
    initialStatus: 'PAUSED',
    startDate: at('09:14:00'),
    endDate: at('19:00:00'),
    unlisted: true,
    questions: statuses.map((entry, i) => {
      const [status, more] = Array.isArray(entry) ? entry : [entry, {}]
      return qbqQuestion(id, i + 1, list[i], status, more)
    }),
    ...extra,
  })
const closedAt = (time) => ({ endedAt: at(time) })

// The sixteen questions of the board's "many" demo: nine closed, one open, six to open (one open at a time, R29).
const MANY = [
  ["Acta de l'assemblea anterior", "Aprovem l'acta de l'assemblea anterior?", [198, 7, 9]],
  ["Memòria d'activitats", "Aprovem la memòria d'activitats de 2026?", [201, 12, 8]],
  ['Comptes de 2026', 'Aprovem els comptes anuals de 2026?', [189, 21, 14]],
  ['Pressupost de 2027', 'Aprovem el pressupost de 2027?', [176, 38, 12]],
  ['Quotes 2027', "Apugem la quota a 48 EUR l'any el 2027?", [171, 52, 11]],
  ['Estatuts, article 4', "Aprovem el nou redactat de l'article 4, sobre els fins de l'entitat?", [192, 18, 15]],
  ['Estatuts, article 9', "Aprovem el nou redactat de l'article 9, sobre les delegacions de vot?", [141, 71, 13]],
  ['Estatuts, article 12', "Aprovem el nou redactat de l'article 12, sobre la durada dels càrrecs?", [165, 27, 15]],
  ['Presidència', 'Ratifiquem Laia Puig Ferrer com a presidenta?', [205, 12, 12]],
  ['Secretaria', 'Ratifiquem Oriol Mas Costa com a secretari?', [86, 7, 5]],
  ['Tresoreria', 'Ratifiquem Núria Font Serra com a tresorera?', [0, 0, 0]],
  ['Vocalia de cultura', 'Ratifiquem Marc Serra Pons com a vocal de cultura?', [0, 0, 0]],
  ['Vocalia de joventut', 'Ratifiquem Carme Riera Soler com a vocal de joventut?', [0, 0, 0]],
  ['Elecció de dues vocalies', 'Ratifiquem les dues vocalies proposades?', [0, 0, 0]],
  ['Auditoria de comptes', 'Encarreguem una auditoria externa dels comptes?', [0, 0, 0]],
  ['Canvi de seu social', 'Traslladem la seu social al carrer Major, 12?', [0, 0, 0]],
]

// All at once: the four ballot kinds of the board.
const multi = (max, n) => ({
  type: 'multichoice',
  typeSetup: { maxChoices: max, minChoices: 0, uniqueChoices: false },
  ballotProtocol: { ...ballot(n), maxCount: n, maxValue: 1, maxTotalCost: max },
})
const AAO = [
  ['Aproves els comptes anuals de 2025?', ['Sí', 'No', 'Abstenció'], {}, [150, 22, 9]],
  // Dense 0/1 fields, one per choice: [did not pick, picked] of the 176 who answered (148 + 97 + 62 + 35 picks).
  [
    'Qui vols a les dues vocalies?',
    ['Laia Puig', 'Oriol Mas', 'Núria Font', 'Marc Serra'],
    multi(2, 4),
    undefined,
    [
      [28, 148],
      [79, 97],
      [114, 62],
      [141, 35],
    ],
  ],
  [
    'Quina inversió va primer?',
    ['Teulada', 'Calefacció', 'Biblioteca'],
    {
      type: undefined,
      typeSetup: undefined,
      metadata: { type: { name: 'ranked' } },
      ballotProtocol: { ...ballot(3), maxCount: 3, maxValue: 2, uniqueValues: true },
    },
  ],
  [
    'Reparteix 10 punts entre les activitats',
    ['Teatre', 'Música', 'Esports', 'Excursions'],
    {
      type: 'budget-based',
      typeSetup: undefined,
      ballotProtocol: { ...ballot(4), maxCount: 4, maxValue: 0, maxTotalCost: 10 },
    },
  ],
]
const AAO_VOTES = [181, 176, 169, 172]
const aaoVote = (id, status, extra = {}) =>
  boardVote(id, 'Assemblea General Ordinària 2026', {
    startDate: '2026-06-08T07:00:00.000Z',
    endDate: '2026-06-17T18:00:00.000Z',
    questions: AAO.map(([title, choices, shape, single, fields], i) => {
      const counted = status !== 'CANCELED' && extra.counted !== false
      const final = status === 'RESULTS'
      const voteCount = counted ? AAO_VOTES[i] : 0
      // The single- and multiple-choice questions carry a tally; the others only their count (secret until the end).
      const results =
        single && counted
          ? tally(single, final)
          : fields && counted
            ? { voteCount, maxVoters: 312, finalResults: final, results: fields.map((pair) => pair.map(String)) }
            : { voteCount, maxVoters: 312, finalResults: final, results: [] }
      return {
        ...question(id, i + 1, title, choices, status, results),
        id: boardQuestionId(id, i + 1),
        secretUntilTheEnd: true,
        ...shape,
        ...(extra.endedAt ? { endedAt: extra.endedAt } : {}),
      }
    }),
    ...extra,
  })

const BOARD_PROCESSES = [
  aaoVote(B_AAO_READY, 'ONGOING', {
    startDate: '2026-06-22T07:00:00.000Z',
    endDate: '2026-06-25T18:00:00.000Z',
    counted: false,
  }),
  { ...aaoVote(B_AAO_LIVE, 'ONGOING'), unlisted: true },
  aaoVote(B_AAO_PAUSED, 'PAUSED'),
  { ...aaoVote(B_AAO_ENDED, 'RESULTS', { endedAt: at('09:42:00') }), unlisted: true },
  aaoVote(B_AAO_CANCELED, 'CANCELED', { endedAt: at('09:42:00') }),
  {
    ...qbqVote(B_QBQ_READY, ['PAUSED', 'PAUSED', 'PAUSED', 'PAUSED'], {
      startDate: '2026-06-20T16:30:00.000Z',
      endDate: '2026-06-20T19:00:00.000Z',
    }),
    unlisted: false,
  },
  qbqVote(B_QBQ_LIVE, [['RESULTS', closedAt('09:41:00')], ['RESULTS', closedAt('09:53:00')], 'ONGOING', 'PAUSED']),
  qbqVote(B_QBQ_HELD, [
    ['RESULTS', closedAt('09:41:00')],
    ['RESULTS', closedAt('09:53:00')],
    ['PAUSED', { voted: true }],
    'PAUSED',
  ]),
  qbqVote(B_QBQ_CLOSED, [
    ['RESULTS', closedAt('09:41:00')],
    ['RESULTS', closedAt('09:44:00')],
    ['RESULTS', closedAt('09:50:00')],
    ['RESULTS', closedAt('09:56:00')],
  ]),
  // Ended with the last question never opened: ending the vote closed the open one and the unopened one together.
  qbqVote(B_QBQ_ENDED, [
    ['RESULTS', closedAt('09:41:00')],
    ['RESULTS', closedAt('09:53:00')],
    ['ENDED', closedAt('09:58:00')],
    ['ENDED', { endedAt: at('09:58:01'), results: tally([0, 0, 0], true) }],
  ]),
  // Canceled after its first question closed: every question voided, the votes discarded.
  qbqVote(B_QBQ_CANCELED, [
    ['CANCELED', closedAt('09:42:00')],
    ['CANCELED', closedAt('09:42:00')],
    ['CANCELED', closedAt('09:42:00')],
    ['CANCELED', closedAt('09:42:00')],
  ]),
  qbqVote(
    B_QBQ_MANY,
    MANY.map((_, i) => {
      const hour = String(Math.floor(i / 3) + 6).padStart(2, '0')
      if (i < 9) return ['RESULTS', closedAt(`${hour}:${String((i * 17) % 60).padStart(2, '0')}:00`)]
      return i === 9 ? 'ONGOING' : 'PAUSED'
    }),
    { startDate: '2026-06-14T16:00:00.000Z' },
    MANY
  ),
]

PROCESSES.push(...BOARD_PROCESSES)

// Reached by id only (`unlisted`), so the admin lists and their captures do not change.
const brandVote = (id, addOns) => ({
  id,
  orgAddress: BRAND_ORG.slice(2),
  chainId: 'vocdoni/DEV/fake',
  title: ml('Members assembly 2027'),
  description: ml('A vote of the cooperative. Everything here is fake.'),
  header: '',
  census,
  published: true,
  unlisted: true,
  startDate: '2026-06-01T08:00:00.000Z',
  endDate: '2030-12-31T20:00:00.000Z',
  createdAt: '2026-05-30T08:00:00.000Z',
  ...(addOns && { addOns }),
  questions: [
    question(id, 1, 'Do you approve the 2027 accounts?', ['Yes', 'No', 'Abstain'], 'ONGOING', {
      voteCount: 4,
      maxVoters: 10,
      finalResults: false,
      results: [['3', '1', '0']],
    }),
  ],
})
PROCESSES.push(brandVote(P_BRANDED, { branding: true }), brandVote(P_BRAND_OFF))

// ---- voter flow votes ---------------------------------------------------------------------
// The voter page's states with the boards' questions (V4VoterWide 4 to 6): one choice, two of four people with a blank
// vote, and a ranking. Dated far from FIXED_NOW, as the main votes, so the server's real clock and the browser's
// frozen one agree. The censuses ask for the member number only, except the 2FA one.
const VOTER_CENSUS = { ...BOARD_CENSUS, authFields: ['memberNumber'], twoFaFields: [] }
const pickSlot = (choices, max) => ({
  type: 'multichoice',
  typeSetup: { maxChoices: max, minChoices: 0, uniqueChoices: false },
  // Room for the abstain values, so a blank vote can be cast.
  ballotProtocol: { ...ballot(choices), maxCount: max, maxValue: choices + max - 1, uniqueValues: true },
})
const VOTER_QUESTIONS = [
  ['Aproves els comptes anuals de 2025?', ['Sí', 'No', 'Abstenció'], {}],
  [
    'Qui vols a les dues vocalies?',
    ['Laia Puig Ferrer', 'Oriol Mas Costa', 'Núria Font Serra', 'Marc Serra Pons'],
    pickSlot(4, 2),
  ],
  [
    'Quina inversió va primer?',
    ['Arreglar la teulada', 'Canviar la calefacció', "Rampa d'accés"],
    {
      type: undefined,
      typeSetup: undefined,
      metadata: { type: { name: 'ranked' } },
      ballotProtocol: { ...ballot(3), maxCount: 3, maxValue: 2, uniqueValues: true },
    },
  ],
]
// The voter flow's demo media: a description on the main vote and a header image on the secret one, so identify and
// welcome show both in the captures. The image is inline, like the brand logo, so no request leaves.
const VOTER_DESCRIPTION =
  'The yearly general assembly of a made-up residents association. Everything on this page is fictional: the ' +
  'accounts, the candidates and the investments.'
const VOTER_HEADER = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400"><rect width="1200" height="400" fill="#dbe4f0"/>' +
    '<circle cx="960" cy="120" r="70" fill="#f5d90a"/>' +
    '<path d="M0 330 L300 200 L520 300 L780 170 L1200 320 V400 H0Z" fill="#7a8ca8"/></svg>'
)}`
// The boards' results (M10, M11): 221 voters. Q1 one row of three; Q2 a pick-slot of two, one row per slot (options,
// then the two abstain values); Q3 ranked, one row per option (rank 0 to 2, 2 the best).
const VOTER_TALLIES = [
  [['163', '41', '17']],
  [
    ['100', '70', '35', '16', '0', '0'],
    ['48', '51', '52', '36', '0', '0'],
  ],
  [
    ['40', '70', '111'],
    ['70', '80', '71'],
    ['111', '71', '39'],
  ],
]
const voterVote = (
  id,
  {
    census = VOTER_CENSUS,
    secret = false,
    status = 'ONGOING',
    description = '',
    header = '',
    endDate = '2030-06-17T18:00:00.000Z',
    tallies,
    final = false,
  } = {}
) =>
  boardVote(id, 'Assemblea General Ordinària 2026', {
    unlisted: true,
    census,
    description: ml(description),
    header,
    startDate: '2026-06-08T07:00:00.000Z',
    endDate,
    questions: VOTER_QUESTIONS.map(([title, choices, shape], i) => ({
      ...question(id, i + 1, title, choices, status, {
        voteCount: tallies ? 221 : 184,
        maxVoters: 312,
        finalResults: final,
        results: tallies?.[i] ?? [],
      }),
      id: boardQuestionId(id, i + 1),
      description: ml(''),
      // A secret question with no published keys: the SDK refuses the cast before signing (the failed review).
      secretUntilTheEnd: secret,
      ...shape,
    })),
  })
// The results' ended votes closed on this day (before the browser's clock), so the page reads them as over.
const VOTER_ENDED = '2026-06-12T18:00:00.000Z'
PROCESSES.push(
  voterVote(V_LIVE, { description: VOTER_DESCRIPTION }),
  voterVote(V_SECRET, { secret: true, header: VOTER_HEADER }),
  voterVote(V_2FA, { census: { ...VOTER_CENSUS, twoFaFields: ['email'] } }),
  voterVote(V_WEIGHTED, { census: { ...VOTER_CENSUS, weighted: true } }),
  voterVote(V_VOTED),
  voterVote(V_NOT_IN),
  voterVote(V_CHECKING),
  voterVote(V_PAUSED, { status: 'PAUSED' }),
  voterVote(V_RESULTS, { tallies: VOTER_TALLIES }),
  voterVote(V_RESULTS_ENDED, { status: 'RESULTS', endDate: VOTER_ENDED, tallies: VOTER_TALLIES, final: true }),
  voterVote(V_RESULTS_SECRET, { status: 'ENDED', endDate: VOTER_ENDED, secret: true })
)
/** V_LIVE paused by the organisation: what the page reads once it refetches (the paused mid-ballot capture). */
export const VOTER_LIVE_PAUSED = voterVote(V_LIVE, { status: 'PAUSED', description: VOTER_DESCRIPTION })
/** V_RESULTS_SECRET extended by the organiser: open and secret again (the hidden results capture). */
export const VOTER_RESULTS_SECRET_REOPENED = voterVote(V_RESULTS_SECRET, { secret: true })
/** A relay that never settles (the sending capture). */
export const RELAY_PENDING = { jobId: 'job-relay', type: 'relay_votes', status: 'pending', result: { votes: [] } }
/** A handler's answer that leaves the request open (the checking capture). */
export const HANG = Symbol('hang')

// The question-by-question vote paused as a whole: the pause memory the app keeps in this browser (vote-pause.ts).
export const HELD_STORAGE = { [`votes.pause.held.${B_QBQ_HELD}`]: JSON.stringify([boardQuestionId(B_QBQ_HELD, 3)]) }

const STATUS_OF = (p) => {
  if (!p.published) return 'DRAFT'
  const s = p.questions[0].status
  return s === 'ONGOING' ? 'READY' : s === 'RESULTS' ? 'ENDED' : s
}

const TEAM = {
  users: [
    { info: { id: 1, email: USER.email, firstName: 'Ada', lastName: 'Testwell' }, role: 'admin' },
    { info: { id: 2, email: 'bob.manager@example.test', firstName: 'Bob', lastName: 'Fakerson' }, role: 'manager' },
    { info: { id: 3, email: 'cleo.viewer@example.test', firstName: 'Cleo', lastName: 'Mockley' }, role: 'viewer' },
  ],
}
const PENDING = {
  pending: [
    { id: 'inv0001', email: 'dan.invited@example.test', role: 'manager', expiration: '2031-01-01T00:00:00.000Z' },
  ],
}
const ROLES = {
  roles: [
    { role: 'admin', name: 'Admin', organizationWritePermission: true, processWritePermission: true },
    { role: 'manager', name: 'Manager', organizationWritePermission: false, processWritePermission: true },
    { role: 'viewer', name: 'Viewer', organizationWritePermission: false, processWritePermission: false },
  ],
}
const TYPES = {
  types: [
    { type: 'association', name: 'Association' },
    { type: 'cooperative', name: 'Cooperative' },
    { type: 'company', name: 'Company' },
    { type: 'political_party', name: 'Political party' },
    { type: 'others', name: 'Others' },
  ],
}

// ---- router -------------------------------------------------------------------------------
const routes = []
const on = (method, pattern, handler) =>
  routes.push({ method: new RegExp(`^(${method})$`), re: new RegExp(`^${pattern}$`), handler })
const session = () => ({ token: FAKE_TOKEN, expirity: TOKEN_EXPIRY })

on('POST', '/auth/login', session)
on('POST', '/auth/refresh', session)
on('GET', '/auth/addresses', () => ({ addresses: [ORG] }))
on('GET', '/users/me', () => USER)
on('PUT', '/users/me', session)
on('GET', '/info', () => ({ chainId: 'vocdoni/DEV/fake', version: 'mock', goVersion: 'none' }))
on('GET', '/plans', () => PLANS)
on('GET', '/plans/([^/]+)', (m) => PLANS.find((p) => p.id === m[1]) || PLAN)
on('GET', '/organizations/roles', () => ROLES)
on('GET', '/organizations/types', () => TYPES)
on('GET', '/organizations/languages', () => ({ languages: ['en', 'es', 'ca'], default: 'en' }))
on('GET', '/organizations/(0x[0-9a-fA-F]+)', (m) => organizationFor(m[1]))
on('GET', '/organizations/([0-9a-fA-F]{40})', (m) => organizationFor(m[1]))
on('PUT', '/organizations/[^/]+', () => ORGANIZATION)
on('GET', '/organizations/[^/]+/subscription', () => ({ subscriptionDetails: SUB_DETAILS, usage: USAGE, plan: PLAN }))
on('GET', '/organizations/[^/]+/wallet', () => ({
  balanceCents: 12500,
  currency: 'eur',
  history: [
    { id: 'w1', orgAddress: ORG, amountCents: 20000, kind: 'topup', createdAt: '2025-01-10T10:00:00Z' },
    {
      id: 'w2',
      orgAddress: ORG,
      amountCents: -7500,
      kind: 'payment',
      processId: P_ONGOING,
      createdAt: '2025-01-12T09:30:00Z',
    },
  ],
  pagination: pagination(2),
}))
on('GET', '/organizations/[^/]+/meta', () => ({
  meta: { isDashboardTutorialClosed: true, isSidebarTutorialClosed: true },
}))
on('PUT|POST', '/organizations/[^/]+/meta', () => ({ meta: {} }))
on('GET', '/organizations/[^/]+/members', (m, q) => {
  const s = (q.get('search') || '').toLowerCase()
  const list = s ? MEMBERS.filter((x) => JSON.stringify(x).toLowerCase().includes(s)) : MEMBERS
  return { members: list, pagination: pagination(list.length) }
})
on('GET', '/organizations/[^/]+/groups', () => ({ groups: GROUPS, pagination: pagination(GROUPS.length) }))
on('GET', '/organizations/[^/]+/groups/([^/]+)', (m) => GROUPS.find((g) => g.id === m[1]) || GROUPS[0])
on('GET', '/organizations/[^/]+/groups/([^/]+)/members', (m) => {
  const g = GROUPS.find((x) => x.id === m[1]) || GROUPS[0]
  const list = MEMBERS.filter((x) => g.memberIds.includes(x.id))
  return { members: list, pagination: pagination(list.length) }
})
on('GET', '/organizations/[^/]+/censuses', () => ({
  censuses: [
    {
      censusId: 'c1',
      type: 'csp',
      orgAddress: ORG,
      size: 10,
      weighted: false,
      groupID: GROUPS[0].id,
      authFields: ['memberNumber'],
      twoFaFields: ['email'],
    },
  ],
}))
on('GET', '/organizations/[^/]+/users', () => TEAM)
on('GET', '/organizations/[^/]+/users/pending', () => PENDING)
on('GET', '/jobs', () => ({ jobs: [], pagination: pagination(0) }))
// The voter's relay (POST /votes): one outcome per vote of the last batch, all on chain. Before the generic job.
let lastBatch = 0
on('GET', '/jobs/job-relay', () => ({
  jobId: 'job-relay',
  type: 'relay_votes',
  status: 'completed',
  result: {
    votes: Array.from({ length: lastBatch }, (_, i) => ({
      status: 'completed',
      voteID: hex64(String.fromCharCode(97 + i)),
    })),
  },
}))
// MOCK_SLOW_JOB_MS keeps a status change pending that long, to see the "still working" state.
const SLOW_JOB_MS = Number(process.env.MOCK_SLOW_JOB_MS) || 0
const statusJobs = new Map()
on('GET', '/jobs/([^/]+)', (m) => {
  const startedAt = statusJobs.get(m[1])
  if (startedAt !== undefined) {
    const pending = Date.now() - startedAt < SLOW_JOB_MS
    return { jobId: m[1], type: 'set_process_status', status: pending ? 'pending' : 'completed', errors: [] }
  }
  return { jobId: m[1], type: 'org_members', status: 'completed', progress: 100, total: 0, added: 0, errors: [] }
})
on('GET', '/processes', (m, q) => {
  let list = PROCESSES.filter((p) => !p.unlisted)
  const pub = q.get('published')
  if (pub === 'true') list = list.filter((p) => p.published)
  if (pub === 'false') list = list.filter((p) => !p.published)
  const st = q.get('status')
  if (st) list = list.filter((p) => STATUS_OF(p) === st)
  // As the API: list items never carry per-question results, and pages follow `page` and `limit`.
  const limit = Math.min(Math.max(Number(q.get('limit')) || 10, 1), 100)
  const lastPage = Math.max(1, Math.ceil(list.length / limit))
  const page = Math.min(Math.max(Number(q.get('page')) || 1, 1), lastPage)
  const processes = list
    .slice((page - 1) * limit, page * limit)
    .map((p) => ({ ...p, questions: p.questions.map(({ results, ...rest }) => rest) }))
  return {
    processes,
    pagination: {
      totalItems: list.length,
      previousPage: page > 1 ? page - 1 : null,
      currentPage: page,
      nextPage: page < lastPage ? page + 1 : null,
      lastPage,
    },
  }
})
on('POST', '/processes', () => ({ processId: P_DRAFT }))
on('POST', '/processes/census/validation', () => '')
on(
  'GET',
  '/processes/([0-9a-f]{24})',
  (m) => PROCESSES.find((p) => p.id === m[1]) || [404, { error: 'process not found', code: 404 }]
)
on('PUT', '/processes/([0-9a-f]{24})', () => undefined)
// Question status changes: applied at once so a local demo can click through. As the backend, a batch that targets a
// question already over is refused whole. MOCK_STATUS_BUSY=1 answers 503, as when another change holds the lock.
const WIRE_STATUS = { ready: 'ONGOING', paused: 'PAUSED', ended: 'ENDED', canceled: 'CANCELED' }
const OVER = new Set(['ENDED', 'RESULTS', 'CANCELED'])
const setStatus = (p, ids, body) => {
  if (process.env.MOCK_STATUS_BUSY === '1') return [503, { error: 'another status change is under way', code: 50303 }]
  let status
  try {
    status = WIRE_STATUS[String(JSON.parse(body || '{}').status || '').toLowerCase()]
  } catch {}
  if (!p || !status) return [400, { error: 'bad status', code: 40001 }]
  const targets = p.questions.filter((qq) => !ids || ids.includes(qq.id))
  const over = targets.find((qq) => OVER.has(qq.status) && qq.status !== status)
  if (over) return [400, { error: `question ${over.id} is ${over.status} and cannot change`, code: 40001 }]
  const now = new Date().toISOString()
  for (const qq of targets) {
    qq.status = status
    if (status === 'ENDED' || status === 'CANCELED') {
      qq.endedAt = now
      if (qq.results) qq.results = { ...qq.results, finalResults: true }
    }
  }
  const jobId = `job-status-${statusJobs.size + 1}`
  statusJobs.set(jobId, Date.now())
  return { jobId }
}
on('PUT', '/processes/([0-9a-f]{24})/questions/status', (m, q, body) => {
  let ids
  try {
    ids = (JSON.parse(body || '{}').questions || []).map((x) => x.id)
  } catch {}
  return setStatus(
    PROCESSES.find((x) => x.id === m[1]),
    ids?.length ? ids : undefined,
    body
  )
})
on('PUT', '/processes/([0-9a-f]{24})/questions/([^/]+)/status', (m, q, body) =>
  setStatus(
    PROCESSES.find((x) => x.id === m[1]),
    [m[2]],
    body
  )
)
on('GET', '/processes/([0-9a-f]{24})/results', (m) => {
  const p = PROCESSES.find((x) => x.id === m[1])
  if (!p) return [404, { error: 'not found' }]
  return {
    id: p.id,
    questions: p.questions.map((qq) => ({ questionId: qq.id, upstreamId: qq.upstreamId, ...(qq.results || {}) })),
  }
})
on('GET', '/processes/([0-9a-f]{24})/price', () => ({
  currency: 'eur',
  lines: [
    { kind: 'base', description: 'Base price, 10 voters', amountCents: 1500 },
    { kind: 'emailTwoFA', description: 'Email verification', amountCents: 500 },
  ],
  totalCents: 2000,
  quoteRecommended: false,
  quoteRequired: false,
}))
on('GET', '/processes/([0-9a-f]{24})/validation', () => ({ valid: true, errors: [] }))
on('GET', '/processes/([0-9a-f]{24})/participants', () => ({
  participants: MEMBERS.slice(0, 3).map((x, i) => ({
    memberId: x.id,
    name: x.name,
    surname: x.surname,
    email: x.email,
    memberNumber: x.memberNumber,
    questions: [{ questionId: 'q1', hasVoted: i !== 2 }],
  })),
}))
// The voter's CSP (auth, check, sign) and relay. An auth-only census knows VOTER_MEMBER only; a 2FA census sends a code
// to any contact and takes any code. V_VOTED and V_RESULTS_SECRET have voted every question, V_NOT_IN is not in the census and V_CHECKING
// never answers the check.
const processById = (id) => PROCESSES.find((x) => x.id === id)
on('POST', '/processes/([0-9a-f]{24})/auth/0', (m, q, body) => {
  const p = processById(m[1])
  if (!p) return [404, { error: 'process not found', code: 404 }]
  let member = {}
  try {
    member = JSON.parse(body || '{}')
  } catch {}
  const twoFactor = (p.census.twoFaFields ?? []).length > 0
  if (!twoFactor && member.memberNumber !== VOTER_MEMBER) return [401, { error: 'participant not found', code: 40802 }]
  return { authToken: `voter-${m[1]}`, ...(p.census.weighted ? { weight: '03' } : {}) }
})
on('POST', '/processes/([0-9a-f]{24})/auth/1', (m) => ({ authToken: `voter-${m[1]}` }))
on('POST', '/processes/([0-9a-f]{24})/auth/resend', () => ({}))
on('POST', '/processes/([0-9a-f]{24})/check', (m) => {
  const p = processById(m[1])
  if (!p) return [404, { error: 'process not found', code: 404 }]
  if (m[1] === V_CHECKING) return HANG
  const voted = m[1] === V_VOTED || m[1] === V_RESULTS_SECRET
  return {
    belongsToProcess: m[1] !== V_NOT_IN,
    ...(p.census.weighted ? { weight: '03' } : {}),
    questions: p.questions.map((qq) => ({
      questionId: qq.id,
      upstreamId: qq.upstreamId,
      canVote: true,
      hasVoted: voted,
      hasSigned: voted,
    })),
  }
})
on('POST', '/processes/([0-9a-f]{24})/sign-info', (m) => {
  const p = processById(m[1])
  const consumed =
    m[1] === V_VOTED || m[1] === V_RESULTS_SECRET
      ? (p?.questions ?? []).map((qq, i) => ({ questionId: qq.id, nullifier: hex64(String(i + 1)) }))
      : []
  return { consumed }
})
on('POST', '/processes/([0-9a-f]{24})/sign-batch', (m, q, body) => {
  let ballots = []
  try {
    ballots = JSON.parse(body || '{}').ballots ?? []
  } catch {}
  return {
    signatures: ballots.map((ballot) => ({
      upstreamId: ballot.upstreamId,
      signature: `0x${'1b'.repeat(65)}`,
      weight: '01',
    })),
  }
})
on('POST', '/votes', (m, q, body) => {
  try {
    lastBatch = (JSON.parse(body || '{}').votes ?? []).length
  } catch {
    lastBatch = 0
  }
  return { jobId: 'job-relay' }
})
on('GET', '/processes/([0-9a-f]{24})/questions/([^/]+)', (m) => {
  const p = PROCESSES.find((x) => x.id === m[1]) || PROCESSES[0]
  return p.questions.find((qq) => qq.id === m[2]) || p.questions[0]
})

// ---- server -------------------------------------------------------------------------------
const corsHeaders = (origin) => ({
  ...(origin ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true' } : {}),
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, Accept-Language, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Max-Age': '600',
  Vary: 'Origin',
})

// Only local app origins get CORS headers.
const isLocalOrigin = (origin) => {
  try {
    const u = new URL(origin)
    return u.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname)
  } catch {
    return false
  }
}

// Starts the mock; resolves to { server, url, unmatched, close() } once it listens. `log` gets one
// line per request and `unmatched` collects the requests no handler knew.
export const startMock = ({ port = MOCK_PORT, log = () => {} } = {}) =>
  new Promise((resolve, reject) => {
    const unmatched = []
    const server = http.createServer((req, res) => {
      const origin = isLocalOrigin(req.headers.origin) ? req.headers.origin : undefined
      const url = new URL(req.url, `http://${MOCK_HOST}:${port}`)
      const p = url.pathname.replace(/\/+$/, '') || '/'
      let body = ''
      req.on('data', (c) => {
        if (body.length < 65536) body += c
      })
      req.on('end', () => {
        if (req.method === 'OPTIONS') {
          res.writeHead(204, corsHeaders(origin))
          return res.end()
        }
        const r = routes.find((x) => x.method.test(req.method) && x.re.test(p))
        let status = 200
        let out
        if (r) {
          out = r.handler(p.match(r.re), url.searchParams, body)
          if (out === HANG) return log(`${req.method} ${url.pathname}${url.search} -> (left open)`)
          if (Array.isArray(out) && typeof out[0] === 'number') [status, out] = out
        } else if (req.method === 'GET') {
          status = 404
          out = { error: `mock: no handler for ${p}`, code: 404 }
          unmatched.push(`${req.method} ${url.pathname}${url.search}`)
        } else {
          // Writes the mock doesn't know succeed silently, so a stray click never breaks a run.
          out = {}
          unmatched.push(`${req.method} ${url.pathname}${url.search} (answered 200 {})`)
        }
        log(`${req.method} ${url.pathname}${url.search} -> ${status}`)
        res.writeHead(status, { 'Content-Type': 'application/json', ...corsHeaders(origin) })
        res.end(out === undefined ? '' : JSON.stringify(out))
      })
    })
    server.once('error', reject)
    server.listen(port, MOCK_HOST, () =>
      resolve({
        server,
        unmatched,
        url: `http://${MOCK_HOST}:${port}`,
        close: () =>
          new Promise((done) => {
            // A request left open (HANG) would keep the server from closing.
            server.closeAllConnections?.()
            server.close(() => done())
          }),
      })
    )
  })

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const port = Number(process.argv[2] || MOCK_PORT)
  startMock({ port, log: (line) => console.log(line) })
    .then(({ url }) => console.log(`mock SaaS on ${url} (org ${ORG})`))
    .catch((e) => {
      console.error(`mock SaaS could not listen on ${MOCK_HOST}:${port}: ${e.message}`)
      process.exit(1)
    })
}
