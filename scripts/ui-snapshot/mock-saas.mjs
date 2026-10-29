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
on('GET', '/organizations/0x[0-9a-fA-F]+', () => ORGANIZATION)
on('GET', '/organizations/[0-9a-fA-F]{40}', () => ORGANIZATION)
on('PUT', '/organizations/[^/]+', () => ORGANIZATION)
on('GET', '/organizations/[^/]+/subscription', () => ({ subscriptionDetails: SUB_DETAILS, usage: USAGE, plan: PLAN }))
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
on('GET', '/jobs/([^/]+)', (m) => ({
  jobId: m[1],
  type: 'org_members',
  status: 'completed',
  progress: 100,
  total: 0,
  added: 0,
  errors: [],
}))
on('GET', '/processes', (m, q) => {
  let list = PROCESSES
  const pub = q.get('published')
  if (pub === 'true') list = list.filter((p) => p.published)
  if (pub === 'false') list = list.filter((p) => !p.published)
  const st = q.get('status')
  if (st) list = list.filter((p) => STATUS_OF(p) === st)
  return { processes: list, pagination: pagination(list.length) }
})
on('POST', '/processes', () => ({ processId: P_DRAFT }))
on('POST', '/processes/census/validation', () => '')
on(
  'GET',
  '/processes/([0-9a-f]{24})',
  (m) => PROCESSES.find((p) => p.id === m[1]) || [404, { error: 'process not found', code: 404 }]
)
on('PUT', '/processes/([0-9a-f]{24})', () => undefined)
on('GET', '/processes/([0-9a-f]{24})/results', (m) => {
  const p = PROCESSES.find((x) => x.id === m[1])
  if (!p) return [404, { error: 'not found' }]
  return {
    id: p.id,
    questions: p.questions.map((qq) => ({ questionId: qq.id, upstreamId: qq.upstreamId, ...(qq.results || {}) })),
  }
})
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
        close: () => new Promise((done) => server.close(() => done())),
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
