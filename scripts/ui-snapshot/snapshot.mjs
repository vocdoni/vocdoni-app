// Offline UI snapshot: renders the app's main screens against a local SaaS mock and saves a PNG and
// the computed styles per route, viewport and colour mode. See README.md.
import { chromium } from '@playwright/test'
import { execFileSync, spawn } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { A11Y_UPDATE_FLAG, checkA11y, safeAudit } from './a11y.mjs'
import { FAKE_TOKEN, FIXED_NOW, MOCK_PORT, ORG, TOKEN_EXPIRY, startMock } from './mock-saas.mjs'
import { captureName, captureNames, DEFAULT_MODES, DEFAULT_VIEWPORTS, ROUTES, statesAt } from './routes.mjs'
import { checkStress, loadSpec, probe, STRESS_MODULE, stressAlias, UPDATE_FLAG } from './stress.mjs'

const USAGE = `pnpm ui:snapshot -- --label <name> [--primary-color <hex>] [--url <base>] [--routes a,b]
                    [--viewports 1440,390] [--modes light,dark] [--no-warmup] [--build]
                    [--theme stress] [${UPDATE_FLAG}] [--a11y] [${A11Y_UPDATE_FLAG}] [--lang ca]`

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const OUT_ROOT = path.join(ROOT, '.ui-snapshot')
// --build writes the production build here, outside OUT_ROOT so the uploaded artifacts stay small. Removed at the end.
const BUILD_ROOT = path.join(ROOT, '.ui-snapshot-build')
// Port 3000 is often taken by another checkout's dev server; UI_SNAPSHOT_PORT picks another one.
const APP_PORT = Number(process.env.UI_SNAPSHOT_PORT || 3000)
const DEFAULT_BASE = `http://localhost:${APP_PORT}`
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1'])
const TIMEZONE = 'Europe/Madrid'
const LOCALE = 'en-US'
const sameItems = (a, b) => a.length === b.length && b.every((item) => a.includes(item))

// Computed properties saved for every visible element. Shorthands cover the four sides.
export const STYLE_PROPS = [
  'color',
  'background-color',
  'background-image',
  'border-color',
  'border-width',
  'border-style',
  'border-radius',
  'box-shadow',
  'outline',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-transform',
  'padding',
  'margin',
  'gap',
  'opacity',
  'z-index',
  'fill',
  'stroke',
]

const DETERMINISM_CSS = [
  '*, *::before, *::after {',
  '  transition: none !important;',
  '  animation: none !important;',
  '  caret-color: transparent !important;',
  '  scroll-behavior: auto !important;',
  '}',
].join('\n')

// 1×1 transparent PNG served for every external image.
const STUB_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
)

// ---- arguments ----------------------------------------------------------------------------
// Thrown for expected failures: main() stops everything it started, then prints the message.
class SnapshotError extends Error {}
const fail = (message) => {
  throw new SnapshotError(message)
}

const parseCli = () => {
  const args = process.argv.slice(2).filter((a) => a !== '--')
  const { values } = parseArgs({
    args,
    options: {
      label: { type: 'string' },
      'primary-color': { type: 'string' },
      url: { type: 'string' },
      routes: { type: 'string' },
      viewports: { type: 'string', default: DEFAULT_VIEWPORTS.join(',') },
      modes: { type: 'string', default: DEFAULT_MODES.join(',') },
      'no-warmup': { type: 'boolean', default: false },
      build: { type: 'boolean', default: false },
      theme: { type: 'string', default: 'stock' },
      'update-stress-baseline': { type: 'boolean', default: false },
      a11y: { type: 'boolean', default: false },
      'update-a11y-baseline': { type: 'boolean', default: false },
      lang: { type: 'string', default: 'en' },
      help: { type: 'boolean', short: 'h', default: false },
    },
  })
  if (values.help) {
    console.log(USAGE)
    process.exit(0)
  }
  if (!values.label || !/^[A-Za-z0-9_][\w.-]*$/.test(values.label)) {
    fail('--label <name> is required (letters, digits, . _ -; must not start with a dot)')
  }
  const primaryColor = values['primary-color']
  if (primaryColor && !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(primaryColor)) {
    fail(`--primary-color must be #rgb or #rrggbb (got "${primaryColor}")`)
  }
  if (primaryColor && values.url) fail('--primary-color needs the dev server this script starts; drop --url')
  if (!['stock', 'stress'].includes(values.theme)) fail('--theme accepts stock or stress')
  const stress = values.theme === 'stress'
  if (stress && primaryColor) fail('--theme stress ignores PRIMARY_COLOR; drop --primary-color')
  if (values['update-stress-baseline'] && !stress) fail(`${UPDATE_FLAG} needs --theme stress`)
  if (values.a11y && stress) fail('--a11y needs the stock theme: the stress palette makes colour-contrast meaningless')
  if (values.a11y && primaryColor)
    fail('--a11y needs the stock palette: --primary-color makes colour-contrast incomparable')
  if (values['update-a11y-baseline'] && !values.a11y) fail(`${A11Y_UPDATE_FLAG} needs --a11y`)
  if (!/^[a-z]{2}(-[a-z]{2})?$/.test(values.lang)) fail('--lang takes a locale folder name, e.g. ca or pt-br')
  if (values.lang !== 'en' && (stress || values.a11y))
    fail('--lang is for side-by-side checks: run stress and a11y in en')
  if (values.build && values.url) fail('--build starts the app itself: drop --url')
  let base = DEFAULT_BASE
  if (values.url) {
    let u
    try {
      u = new URL(values.url)
    } catch {
      fail(`--url is not a URL: ${values.url}`)
    }
    if (!LOCAL_HOSTS.has(u.hostname)) fail('--url must point to localhost or 127.0.0.1 (everything else is blocked)')
    base = u.origin
  }
  const viewports = values.viewports.split(',').map(Number)
  if (viewports.some((w) => !Number.isInteger(w) || w < 200)) fail(`--viewports must be widths, e.g. 1440,390`)
  const modes = values.modes.split(',')
  if (modes.some((m) => !['light', 'dark'].includes(m))) fail('--modes accepts light and/or dark')
  const only = values.routes ? values.routes.split(',') : null
  const unknown = only?.filter((s) => !ROUTES.some((r) => r.slug === s))
  if (unknown?.length) fail(`unknown route(s): ${unknown.join(', ')}. Known: ${ROUTES.map((r) => r.slug).join(', ')}`)
  return {
    label: values.label,
    primaryColor,
    base,
    external: !!values.url,
    viewports,
    modes,
    routes: only ? ROUTES.filter((r) => only.includes(r.slug)) : ROUTES,
    // Only a run over every capture may prune the a11y baseline (see checkA11y).
    fullRun: !only && sameItems(viewports, DEFAULT_VIEWPORTS) && sameItems(modes, DEFAULT_MODES),
    build: values.build,
    // Warm-up compiles routes on demand in the dev server; a production build has nothing to compile.
    warmup: !values['no-warmup'] && !values.build,
    stress,
    updateStressBaseline: values['update-stress-baseline'],
    a11y: values.a11y,
    updateA11yBaseline: values['update-a11y-baseline'],
    lang: values.lang,
  }
}

// ---- processes ----------------------------------------------------------------------------
const portInUse = (port) =>
  Promise.all(
    ['127.0.0.1', '::1'].map(
      (host) =>
        new Promise((resolve) => {
          const socket = net.connect({ port, host })
          const done = (used) => {
            socket.destroy()
            resolve(used)
          }
          socket.setTimeout(700, () => done(false))
          socket.once('connect', () => done(true))
          socket.once('error', () => done(false))
        })
    )
  ).then((r) => r.some(Boolean))

// The authentication storage key lives in the app; read it so the two never drift apart.
const readAuthStorageKey = () => {
  const file = path.join(ROOT, 'src/providers/ApiClientProvider.tsx')
  const match = fs.readFileSync(file, 'utf8').match(/export const AUTH_STORAGE_KEY = '([^']+)'/)
  if (!match) fail(`could not find AUTH_STORAGE_KEY in ${path.relative(ROOT, file)}`)
  return match[1]
}

// Env for the dev server: the mock backend, and every third-party integration switched off.
const appEnv = (mockUrl, primaryColor) => ({
  SAAS_URL: mockUrl,
  // Server-rendered dates use the same zone as the browser.
  TZ: TIMEZONE,
  OAUTH_URL: `${mockUrl}/oauth`,
  APP_URL: DEFAULT_BASE,
  VOCDONI_ENVIRONMENT: 'dev',
  PRIMARY_COLOR: primaryColor || '',
  GTM_CONTAINER_ID: '',
  PLAUSIBLE_DOMAIN: '',
  POSTHOG_KEY: '',
  CRISP_WEBSITE_ID: '',
  ANALYTICS_CLIENT_ID: '',
  STRIPE_PUBLIC_KEY: '',
  CALCOM_EVENT_SLUG: '',
  ANNOUNCEMENT: '',
  HOME_PROCESS_ID: '',
  PROCESS_IDS: '',
  CUSTOM_ORGANIZATION_DOMAINS: '',
  SHOW_ORG_LOGO: '',
  HIDE_VOTER_COUNT: '',
  STREAM_URL: '',
  APP_TITLE: '',
  LANGUAGES: '',
  VIDEO_TUTORIAL: '',
  PRIORITY_SUPPORT_PHONE: '',
  WHATSAPP_PHONE_NUMBER: '',
  SHARED_CENSUS_ALWAYS_VISIBLE_TEXT: '',
  SHARED_CENSUS_DISCONNECTED_TEXT: '',
  SHARED_CENSUS_CONNECTED_TEXT: '',
  SHARED_CENSUS_POST_TEXT: '',
})

const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*m/g, '')

// Vite overrides for the dev server (see README.md "What the snapshot does"): bind to 127.0.0.1, since
// the app's own `host: true` would expose the mock-backed app on the LAN, allow a symlinked
// node_modules, and swap in the stress theme. Vike rejects --host on its CLI, hence VITE_CONFIG, which
// `vike dev` merges in.
const viteConfigEnv = (stress) => {
  const server = { host: '127.0.0.1', port: APP_PORT, strictPort: true }
  const link = path.join(ROOT, 'node_modules')
  try {
    const real = fs.realpathSync(link)
    if (real !== link && !real.startsWith(`${ROOT}${path.sep}`)) server.fs = { allow: [ROOT, real] }
  } catch {}
  return { VITE_CONFIG: JSON.stringify({ server, ...(stress && { resolve: { alias: stressAlias() } }) }) }
}

// Set as soon as a child is spawned, so an interrupt during its start-up still stops it.
let spawnedApp = null
// Set by the signal handler: whatever was still starting stops quietly, and the handler exits 130.
let interrupted = false

// Spawns `command` in its own process group, so stopping it also stops what it started. Output goes to the log
// file and to memory, for the readiness checks. `exit` resolves once the child and its output pipes are closed.
const spawnApp = ({ command, args, env, logFile }) => {
  // An interrupt during an await before the spawn has already run the cleanup, so nothing may start after it.
  if (interrupted) fail('interrupted')
  const log = fs.createWriteStream(logFile)
  let output = ''
  const child = spawn(command, args, {
    cwd: ROOT,
    env: { ...process.env, ...env, FORCE_COLOR: '0', BROWSER: 'none' },
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const onData = (chunk) => {
    const text = chunk.toString()
    output += stripAnsi(text)
    log.write(text)
  }
  child.stdout.on('data', onData)
  child.stderr.on('data', onData)
  let exited = null
  const exit = new Promise((resolve) => child.once('close', (code, signal) => resolve((exited = { code, signal }))))
  const app = {
    log: () => output,
    exited: () => exited,
    exit,
    stop: async () => {
      const killGroup = (signal) => {
        try {
          process.kill(-child.pid, signal)
        } catch {}
      }
      if (!exited) {
        killGroup('SIGTERM')
        const timer = setTimeout(() => killGroup('SIGKILL'), 5000)
        await exit
        clearTimeout(timer)
      }
      log.end()
    },
  }
  spawnedApp = app
  return app
}

const requireFreePort = async () => {
  if (await portInUse(APP_PORT)) {
    fail(
      `port ${APP_PORT} is already in use. Stop whatever listens there (lsof -nP -iTCP:${APP_PORT} -sTCP:LISTEN), ` +
        'or start the app yourself and pass --url (see README.md).'
    )
  }
}

// Whether the app at DEFAULT_BASE answers (anything below a 500).
const answers = async () => {
  try {
    const res = await fetch(`${DEFAULT_BASE}/`, { signal: AbortSignal.timeout(5000) })
    return res.status < 500
  } catch {
    return false
  }
}

const startDevServer = async ({ mockUrl, primaryColor, stress, logFile }) => {
  await requireFreePort()
  const dev = spawnApp({
    command: 'pnpm',
    args: ['exec', 'vike', 'dev'],
    env: { ...appEnv(mockUrl, primaryColor), ...viteConfigEnv(stress) },
    logFile,
  })
  const deadline = Date.now() + 120_000
  for (;;) {
    if (dev.exited()) {
      await dev.stop()
      fail(`the dev server exited early (${JSON.stringify(dev.exited())}). Log: ${logFile}`)
    }
    const local = dev.log().match(/Local:\s+http:\/\/[^:/\s]+:(\d+)/)
    if (local && Number(local[1]) !== APP_PORT) {
      await dev.stop()
      fail(`vite started on port ${local[1]} instead of ${APP_PORT}: something else holds ${APP_PORT}.`)
    }
    if (local && (await answers())) return dev
    if (Date.now() > deadline) {
      await dev.stop()
      fail(`the dev server did not answer on ${DEFAULT_BASE} within 120 s. Log: ${logFile}`)
    }
    await new Promise((r) => setTimeout(r, 500))
  }
}

// Builds the app into buildDir, as `pnpm build` does, with the dev server's env. `vike build` is used rather than
// `vite build` because only the vike CLI reads VITE_CONFIG, which carries the stress alias.
const buildApp = async ({ mockUrl, primaryColor, stress, buildDir, logFile }) => {
  const build = spawnApp({
    command: 'pnpm',
    args: ['exec', 'vike', 'build'],
    env: {
      ...appEnv(mockUrl, primaryColor),
      NODE_ENV: 'production',
      BUILD_PATH: buildDir,
      VITE_CONFIG: stress ? JSON.stringify({ resolve: { alias: stressAlias() } }) : undefined,
      UI_SNAPSHOT_TEST_THEME: stress ? '1' : undefined,
    },
    logFile,
  })
  const exit = await build.exit
  await build.stop()
  if (interrupted) return
  if (exit.code !== 0) fail(`the build failed (${JSON.stringify(exit)}). Log: ${logFile}`)
}

// Serves the production build with the app's own server (server/index.mjs). The SSR cache is off, so every capture
// renders the same way.
const startProdServer = async ({ mockUrl, primaryColor, buildDir, logFile }) => {
  await requireFreePort()
  const server = spawnApp({
    command: process.execPath,
    args: ['server/index.mjs'],
    env: {
      ...appEnv(mockUrl, primaryColor),
      NODE_ENV: 'production',
      PORT: String(APP_PORT),
      UI_SNAPSHOT_HOST: '127.0.0.1',
      DIST_DIR: buildDir,
      SSR_CACHE: 'off',
    },
    logFile,
  })
  const deadline = Date.now() + 120_000
  for (;;) {
    if (server.exited()) {
      await server.stop()
      fail(`the server exited early (${JSON.stringify(server.exited())}). Log: ${logFile}`)
    }
    if (server.log().includes('Server running at') && (await answers())) return server
    if (Date.now() > deadline) {
      await server.stop()
      fail(`the server did not answer on ${DEFAULT_BASE} within 120 s. Log: ${logFile}`)
    }
    await new Promise((r) => setTimeout(r, 500))
  }
}

const launchBrowser = async () => {
  const channel = process.env.UI_SNAPSHOT_CHANNEL || undefined
  // Our own signal handlers stop the browser, the dev server and the mock in order; Playwright's
  // would close the browser and exit before the dev server is stopped.
  const options = { handleSIGINT: false, handleSIGTERM: false, handleSIGHUP: false }
  try {
    return { browser: await chromium.launch({ ...options, channel }), channel: channel ?? 'bundled' }
  } catch (e) {
    if (channel || !/Executable doesn't exist|please run.*install/is.test(e.message)) throw e
    console.log('Bundled Chromium is not installed; falling back to channel "chrome".')
    return { browser: await chromium.launch({ ...options, channel: 'chrome' }), channel: 'chrome' }
  }
}

// ---- page helpers -------------------------------------------------------------------------
const isLocalUrl = (url) => {
  try {
    const u = new URL(url)
    return ['data:', 'blob:', 'about:'].includes(u.protocol) || LOCAL_HOSTS.has(u.hostname)
  } catch {
    return false
  }
}

const newPage = async (browser, { width, mode, auth, authKey, blocked, storage = {} }) => {
  const context = await browser.newContext({
    viewport: { width, height: width < 768 ? 844 : 900 },
    deviceScaleFactor: 1,
    isMobile: width < 768,
    hasTouch: width < 768,
    colorScheme: mode,
    reducedMotion: 'reduce',
    locale: LOCALE,
    timezoneId: TIMEZONE,
    serviceWorkers: 'block',
  })
  const page = await context.newPage()
  const record = { consoleErrors: [], failedRequests: [], blockedHosts: new Set() }
  const block = (host) => {
    record.blockedHosts.add(host)
    blocked.add(host)
  }

  // Nothing leaves the machine: external images and embeds are stubbed, everything else aborted.
  await context.route('**/*', (route) => {
    const request = route.request()
    if (isLocalUrl(request.url())) return route.continue()
    block(new URL(request.url()).hostname)
    const type = request.resourceType()
    if (type === 'image') return route.fulfill({ status: 200, contentType: 'image/png', body: STUB_PNG })
    // An empty script: embeds (the YouTube player API) then simply never start, without an error.
    if (type === 'script') return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' })
    if (type === 'document') {
      return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>stub</title>' })
    }
    return route.abort('blockedbyclient')
  })
  await context.routeWebSocket(
    (url) => !isLocalUrl(url.href),
    (ws) => {
      block(new URL(ws.url()).hostname)
      ws.close()
    }
  )
  await context.addCookies([{ name: 'vocdoni-cookie-consent', value: 'rejected', url: DEFAULT_BASE }])
  await page.clock.setFixedTime(new Date(FIXED_NOW))
  await context.addInitScript(
    ({ mode, auth, authKey, org, token, expiry, css, storage }) => {
      // Seeded Math.random (mulberry32): testimonials, avatars etc. pick the same item every run.
      let seed = 0x5eed
      Math.random = () => {
        seed = (seed + 0x6d2b79f5) | 0
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
      }
      try {
        localStorage.setItem('theme-preference', mode)
        localStorage.setItem('vocdoni-cookie-consent', 'rejected')
        localStorage.setItem('vocdoni-cookie-consent-migrated', '1')
        for (const [key, value] of Object.entries(storage)) localStorage.setItem(key, value)
        if (auth) {
          localStorage.setItem(`${authKey}.token`, token)
          localStorage.setItem(`${authKey}.expiry`, expiry)
          // The active organisation is the first one /users/me returns (the mock has one).
        } else {
          localStorage.removeItem(`${authKey}.token`)
          localStorage.removeItem(`${authKey}.expiry`)
        }
      } catch {}
      // Init scripts run before <html> exists: add the style as soon as it does.
      const addStyle = () => {
        const style = document.createElement('style')
        style.setAttribute('data-ui-snapshot', '')
        style.textContent = css
        document.documentElement.appendChild(style)
      }
      if (document.documentElement) addStyle()
      else {
        const observer = new MutationObserver(() => {
          if (!document.documentElement) return
          observer.disconnect()
          addStyle()
        })
        observer.observe(document, { childList: true })
      }
    },
    { mode, auth, authKey, org: ORG, token: FAKE_TOKEN, expiry: TOKEN_EXPIRY, css: DETERMINISM_CSS, storage }
  )
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const loc = m.location()?.url
    record.consoleErrors.push(`${m.text().slice(0, 400)}${loc ? ` (${loc.replace(/\?.*$/, '')})` : ''}`)
  })
  page.on('pageerror', (e) => record.consoleErrors.push(`pageerror: ${String(e.message || e).slice(0, 2000)}`))
  page.on('requestfailed', (r) => {
    if (!isLocalUrl(r.url())) return // already listed as a blocked host
    // A document request aborted by the next navigation (a client-side redirect) is not a failure.
    if (r.resourceType() === 'document' && r.failure()?.errorText === 'net::ERR_ABORTED') return
    record.failedRequests.push(`${r.method()} ${r.url()} ${r.failure()?.errorText ?? ''}`.trim())
  })
  page.on('response', (r) => {
    if (r.status() >= 400) record.failedRequests.push(`${r.request().method()} ${r.url()} -> ${r.status()}`)
  })
  return { context, page, record }
}

// Waits until the page is quiet: network idle, no spinners or skeletons, fonts loaded, DOM stable.
const settle = async (page, warnings) => {
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => warnings.push('network never idle'))
  await page
    .waitForFunction(
      () => {
        const busy = document.querySelectorAll(
          '.chakra-spinner, .chakra-skeleton, [data-scope="skeleton"], [data-part="spinner"], [aria-busy="true"]'
        )
        return [...busy].every((el) => !el.getClientRects().length)
      },
      null,
      { timeout: 10_000, polling: 100 }
    )
    .catch(() => warnings.push('spinner or skeleton still visible after 10 s'))
  await page.evaluate(() => document.fonts.ready)
  // Stable = the same element count, page height and text length on three polls in a row.
  await page
    .waitForFunction(
      () => {
        const sig = `${document.getElementsByTagName('*').length}:${document.documentElement.scrollHeight}:${document.body.innerText.length}`
        const w = window
        w.__uiSnapshotSig = w.__uiSnapshotSig || []
        w.__uiSnapshotSig.push(sig)
        const last = w.__uiSnapshotSig.slice(-3)
        return last.length === 3 && last.every((s) => s === sig)
      },
      null,
      { timeout: 8000, polling: 250 }
    )
    .catch(() => warnings.push('DOM still changing after 8 s'))
  await page.evaluate(() => {
    window.__uiSnapshotSig = []
    return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  })
}

// Runs in the page: computed styles of every visible element, keyed by a stable path.
// Path segment = tag, `:n` (nth-of-type) when the parent has several children with that tag,
// and `[scope.part]` from Chakra/Zag's data-scope/data-part. Rows are [styleIndex, width, height].
const collectStyles = (props) => {
  const SKIP = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT', 'TEMPLATE', 'TITLE', 'HEAD', 'BR', 'WBR'])
  const styles = []
  const styleIndex = new Map()
  const elements = {}
  const segment = (el) => {
    let s = el.tagName.toLowerCase()
    const parent = el.parentElement
    if (parent) {
      let n = 0
      let index = 0
      for (const sibling of parent.children) {
        if (sibling.tagName === el.tagName) {
          n += 1
          if (sibling === el) index = n
        }
      }
      if (n > 1) s += `:${index}`
    }
    const scope = el.getAttribute('data-scope')
    const part = el.getAttribute('data-part')
    if (scope || part) s += `[${scope || ''}.${part || ''}]`
    return s
  }
  const record = (el, key, cs) => {
    const rect = el.getBoundingClientRect()
    if (cs.visibility === 'hidden' || (rect.width === 0 && rect.height === 0)) return
    const values = props.map((p) => cs.getPropertyValue(p))
    const sig = values.join('\u0001')
    let index = styleIndex.get(sig)
    if (index === undefined) {
      index = styles.length
      styles.push(values)
      styleIndex.set(sig, index)
    }
    elements[key] = [index, Math.round(rect.width), Math.round(rect.height)]
  }
  const walk = (el, key) => {
    for (const child of el.children) {
      if (SKIP.has(child.tagName) || child.hasAttribute('data-ui-snapshot')) continue
      const cs = getComputedStyle(child)
      if (cs.display === 'none') continue
      const childKey = `${key}>${segment(child)}`
      record(child, childKey, cs)
      // An svg is captured as a whole: its color/fill/stroke cover the icon.
      if (!(child instanceof SVGElement)) walk(child, childKey)
    }
  }
  record(document.documentElement, 'html', getComputedStyle(document.documentElement))
  record(document.body, 'body', getComputedStyle(document.body))
  walk(document.body, 'body')
  return { props, styles, elements }
}

// Runs one step of a state. A candidate is `[role, name]` or `['css', selector]` (click the first visible match),
// `['fill', selector, value]` (type into the first visible match), `['wait', selector]` (wait for a visible match, click
// nothing: the screen a mocked change should lead to), `['mock', pathname, body]` (from now on, answer that
// mock path with this JSON in this page) or `['refocus']` (the page regains focus: react-query refetches what is stale).
// How long a css or fill step waits for its target to show.
const STEP_WAIT_MS = 8000

// A server-rendered page (the voter page) shows its buttons before React hydrates them, and a click in that window is
// lost: wait until React owns the page's root (it tags hydrated elements with its own keys). Other pages pass at once.
const waitHydrated = (page) =>
  page
    .waitForFunction(
      () => {
        const root = document.querySelector('[data-testid="voter-screen"]')
        return !root || Object.keys(root).some((key) => key.startsWith('__react'))
      },
      undefined,
      { timeout: STEP_WAIT_MS }
    )
    .catch(() => {})

const runStep = async (page, candidates) => {
  const instant = ([role]) => role === 'refocus' || role === 'mock'
  const run = async ([role, name, value]) => {
    if (role === 'refocus') {
      // Hidden, then visible: react-query only refetches when its focus state changes, and the page may have set it
      // already.
      await page.evaluate(() => {
        for (const state of ['hidden', 'visible']) {
          Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state })
          window.dispatchEvent(new Event('visibilitychange'))
        }
      })
    } else {
      await page.route(
        (url) => url.port === String(MOCK_PORT) && url.pathname === name,
        (request) => request.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(value) })
      )
    }
  }
  const targets = candidates
    .filter((candidate) => !instant(candidate))
    .map(([role, name, value]) => ({
      role,
      value,
      loc: role === 'css' || role === 'fill' || role === 'wait' ? page.locator(name) : page.getByRole(role, { name }),
    }))
  // A voter step often follows a screen change that waits on the mock (identify, the membership check, the cast) or
  // on hydration: poll for its target, found by selector or by role, until a visible one takes the action. A single
  // wait is not enough: a screen can show the target for a frame and re-render it away (the check settling), and the
  // element is then gone by the time it is counted. All alternatives share one deadline, so an absent one costs nothing.
  const deadline = Date.now() + STEP_WAIT_MS
  let lastError = null
  while (targets.length) {
    for (const { role, value, loc } of targets) {
      const n = await loc.count()
      for (let i = 0; i < n; i++) {
        const el = loc.nth(i)
        if (!(await el.isVisible().catch(() => false))) continue
        try {
          if (role === 'wait') return true
          if (role === 'fill') await el.fill(value, { timeout: 5000 })
          else await el.click({ timeout: 5000 })
          return true
        } catch (error) {
          // Detached or covered while acting: look again.
          lastError = error
        }
      }
    }
    if (Date.now() >= deadline) break
    await page.waitForTimeout(100)
  }
  for (const candidate of candidates.filter(instant)) {
    await run(candidate)
    return true
  }
  if (lastError) console.warn(`step found its target but could not act: ${String(lastError.message).split('\n')[0]}`)
  return false
}

// ---- run ----------------------------------------------------------------------------------
const gitInfo = () => {
  try {
    const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT }).toString().trim()
    const dirty = execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: ROOT }).toString()
    return { commit, dirty: dirty.trim().length > 0 }
  } catch {
    return { commit: 'unknown', dirty: null }
  }
}

const RELOAD_RE = /new dependencies optimized|optimized dependencies changed|page reload/i

const main = async () => {
  const opts = parseCli()
  const authKey = readAuthStorageKey()
  const outDir = path.join(OUT_ROOT, opts.label)
  // Never delete anything outside .ui-snapshot/<label>.
  if (path.dirname(outDir) !== OUT_ROOT) fail(`refusing to write outside ${path.relative(ROOT, OUT_ROOT)}/`)
  fs.rmSync(outDir, { recursive: true, force: true })
  fs.mkdirSync(outDir, { recursive: true })
  const startedAt = Date.now()
  const mockLog = fs.createWriteStream(path.join(outDir, 'mock-requests.log'))

  let mock
  let app
  let browser
  let buildDir = null
  // One run shared by the signal handler and the finally block, so each waits for the whole stop.
  let cleanupRun = null
  const cleanup = () => {
    cleanupRun ??= (async () => {
      await browser?.close().catch(() => {})
      await (app ?? spawnedApp)?.stop().catch(() => {})
      await mock?.close().catch(() => {})
      mockLog.end()
      if (buildDir) {
        fs.rmSync(buildDir, { recursive: true, force: true })
        // Drops the parent too, unless another label's build is still in it (rmdir refuses a non-empty folder).
        try {
          fs.rmdirSync(BUILD_ROOT)
        } catch {}
      }
    })()
    return cleanupRun
  }
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.once(signal, async () => {
      interrupted = true
      console.error(`\nui:snapshot: ${signal}, stopping the mock, the app server and the browser…`)
      await cleanup()
      process.exit(130)
    })
  }

  try {
    try {
      mock = await startMock({ port: MOCK_PORT, log: (line) => mockLog.write(`${line}\n`) })
    } catch (e) {
      fail(`the SaaS mock could not listen on 127.0.0.1:${MOCK_PORT} (${e.code || e.message}). Is another run active?`)
    }
    console.log(`Mock SaaS API on ${mock.url}`)
    const variant = opts.stress ? ' (stress theme)' : opts.primaryColor ? ` (PRIMARY_COLOR=${opts.primaryColor})` : ''
    if (opts.external) {
      console.log(`Using the app at ${opts.base}. It must run with SAAS_URL=${mock.url} (see README.md).`)
    } else if (opts.build) {
      await requireFreePort()
      buildDir = path.join(BUILD_ROOT, opts.label)
      console.log(`Building the app${variant}…`)
      await buildApp({
        mockUrl: mock.url,
        primaryColor: opts.primaryColor,
        stress: opts.stress,
        buildDir,
        logFile: path.join(outDir, 'build.log'),
      })
      if (interrupted) return
      console.log(`Starting the built app on ${DEFAULT_BASE}…`)
      app = await startProdServer({
        mockUrl: mock.url,
        primaryColor: opts.primaryColor,
        buildDir,
        logFile: path.join(outDir, 'server.log'),
      })
    } else {
      console.log(`Starting the dev server on ${DEFAULT_BASE}${variant}…`)
      app = await startDevServer({
        mockUrl: mock.url,
        primaryColor: opts.primaryColor,
        stress: opts.stress,
        logFile: path.join(outDir, 'dev-server.log'),
      })
    }
    const launched = await launchBrowser()
    browser = launched.browser
    const blocked = new Set()

    const visit = async ({ route, state, width, mode }) => {
      const warnings = []
      const { context, page, record } = await newPage(browser, {
        width,
        mode,
        auth: route.auth !== false,
        authKey,
        blocked,
        storage: route.storage,
      })
      try {
        // A route's own answers for some mock paths (an empty list), checked before the request reaches the mock.
        for (const [pathname, body] of Object.entries(route.mock || {})) {
          await page.route(
            (url) => url.port === String(MOCK_PORT) && url.pathname === pathname,
            (request) => request.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
          )
        }
        // Straight to the language's URL: the app would otherwise redirect /admin to /en/admin.
        await page.goto(`${opts.base}/${opts.lang}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 60_000 })
        await settle(page, warnings)
        return { context, page, record, warnings }
      } catch (e) {
        await context.close()
        throw e
      }
    }

    // Safety net for --url: the app must talk to the mock, never to a hosted API. In stress mode it
    // also checks that the stress theme is the one rendering and reads the probe's inputs from it.
    let stressSpec = null
    const checkBackend = async () => {
      const { context, page } = await visit({
        route: ROUTES.find((r) => r.slug === 'signin'),
        width: 1440,
        mode: 'light',
      })
      const ctx = await page
        .evaluate(() =>
          ['vike_globalContext', 'vike_pageContext']
            .map((id) => document.getElementById(id)?.textContent || '')
            .join('\n')
        )
        .then((text) => text.replace(/\\/g, '')) // the serializer escapes every slash
      if (opts.stress) stressSpec = await loadSpec(page)
      await context.close()
      if (opts.stress && !stressSpec) {
        fail(`the app at ${opts.base} does not render the stress theme (${STRESS_MODULE}); see README.md.`)
      }
      if (!ctx.includes(mock.url)) {
        fail(`the app at ${opts.base} is not configured with SAAS_URL=${mock.url}; refusing to snapshot it.`)
      }
      const hex = opts.primaryColor?.toLowerCase().replace(/^#(.)(.)(.)$/, '#$1$1$2$2$3$3')
      if (hex && !ctx.toLowerCase().includes(hex)) {
        fail(`PRIMARY_COLOR=${opts.primaryColor} did not reach the app.`)
      }
    }
    await checkBackend()

    const jobs = []
    for (const route of opts.routes) {
      for (const width of opts.viewports) {
        for (const mode of opts.modes) {
          jobs.push({ route, width, mode, states: statesAt(route, width) })
        }
      }
    }

    // Warm-up: vite optimizes dependencies the first time a route needs them and reloads the
    // page when it does. Visit every route once so no reload lands in the middle of a capture.
    // States are skipped: a dialog or menu rarely loads a module its route did not already load.
    if (opts.warmup) {
      for (let round = 1; round <= 3; round++) {
        const before = app ? app.log().length : 0
        console.log(`Warm-up round ${round}…`)
        for (const route of opts.routes) {
          const { context } = await visit({ route, width: 1440, mode: 'light' }).catch(() => ({}))
          await context?.close()
        }
        if (!app || !RELOAD_RE.test(app.log().slice(before))) break
      }
    }

    const captures = []
    const captureStart = app ? app.log().length : 0
    const save = async (page, name, fullPage) => {
      const styles = await page.evaluate(collectStyles, STYLE_PROPS)
      fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(styles))
      await page.screenshot({
        path: path.join(outDir, `${name}.png`),
        fullPage,
        animations: 'disabled',
        caret: 'hide',
        scale: 'css',
      })
      return Object.keys(styles.elements).length
    }

    for (const { route, width, mode, states } of jobs) {
      if (interrupted) return // the signal handler is stopping everything
      const t0 = Date.now()
      const base = { route: route.slug, viewport: width, mode }
      let visited
      try {
        visited = await visit({ route, width, mode })
        const name = captureName(route, width, mode)
        const elements = await save(visited.page, name, true)
        const stress = stressSpec && (await probe(visited.page, stressSpec))
        const a11y = opts.a11y && (await safeAudit(visited.page))
        captures.push({
          ...base,
          state: null,
          file: name,
          url: visited.page.url().replace(opts.base, ''),
          elements,
          ms: Date.now() - t0,
          warnings: [...visited.warnings],
          consoleErrors: [...visited.record.consoleErrors],
          failedRequests: [...visited.record.failedRequests],
          blockedHosts: [...visited.record.blockedHosts].sort(),
          ...(stress && { stress }),
          ...(a11y && { a11y }),
        })
        console.log(`${name}: ${elements} elements, ${Date.now() - t0} ms`)
      } catch (e) {
        captures.push({ ...base, state: null, error: String(e.message || e).slice(0, 500) })
        console.log(`${captureName(route, width, mode)}: ERROR ${e.message}`)
        await visited?.context.close()
        continue
      }
      for (const [i, state] of states.entries()) {
        const s0 = Date.now()
        const name = captureName(route, width, mode, state)
        try {
          if (i > 0) {
            await visited.context.close()
            visited = await visit({ route, width, mode })
          }
          const errorsBefore = visited.record.consoleErrors.length
          const failedBefore = visited.record.failedRequests.length
          const warnings = []
          await waitHydrated(visited.page)
          for (const [n, step] of state.open.entries()) {
            if (!(await runStep(visited.page, step))) {
              const on = await visited.page
                .locator('[data-testid="voter-screen"]')
                .first()
                .getAttribute('data-screen', { timeout: 1000 })
                .catch(() => null)
              const where = on ? `, on screen ${on}` : ''
              throw new Error(`no visible trigger for ${state.slug} (step ${n + 1}: ${String(step[0][1])}${where})`)
            }
          }
          await settle(visited.page, warnings)
          const elements = await save(visited.page, name, false)
          const stress = stressSpec && (await probe(visited.page, stressSpec))
          const a11y = opts.a11y && (await safeAudit(visited.page))
          captures.push({
            ...base,
            state: state.slug,
            file: name,
            url: visited.page.url().replace(opts.base, ''),
            elements,
            ms: Date.now() - s0,
            warnings,
            consoleErrors: visited.record.consoleErrors.slice(errorsBefore),
            failedRequests: visited.record.failedRequests.slice(failedBefore),
            blockedHosts: [...visited.record.blockedHosts].sort(),
            ...(stress && { stress }),
            ...(a11y && { a11y }),
          })
          console.log(`${name}: ${elements} elements, ${Date.now() - s0} ms`)
        } catch (e) {
          captures.push({ ...base, state: state.slug, error: String(e.message || e).slice(0, 500) })
          console.log(`${name}: ERROR ${e.message}`)
        }
      }
      await visited.context.close()
    }

    if (interrupted) return
    const reloads = app
      ? app
          .log()
          .slice(captureStart)
          .split('\n')
          .filter((l) => RELOAD_RE.test(l))
      : []
    const summary = {
      label: opts.label,
      startedAt: new Date(startedAt).toISOString(),
      durationMs: Date.now() - startedAt,
      ...gitInfo(),
      browser: { channel: launched.channel, version: browser.version() },
      baseUrl: opts.base,
      devServer: opts.external ? 'external' : opts.build ? 'build' : 'spawned',
      build: opts.build,
      primaryColor: opts.primaryColor ?? null,
      theme: opts.stress ? 'stress' : 'stock',
      a11y: opts.a11y,
      fixedTime: new Date(FIXED_NOW).toISOString(),
      timezone: TIMEZONE,
      locale: LOCALE,
      viewports: opts.viewports,
      modes: opts.modes,
      styleProps: STYLE_PROPS,
      blockedHosts: [...blocked].sort(),
      mockUnmatched: [...new Set(mock.unmatched)].sort(),
      devServerReloadsDuringCapture: reloads,
      captures,
    }
    fs.writeFileSync(path.join(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`)

    const errored = captures.filter((c) => c.error)
    const noisy = captures.filter((c) => c.consoleErrors?.length)
    console.log(
      `\n${captures.length - errored.length}/${captures.length} captures in ${Math.round(summary.durationMs / 1000)} s → ${path.relative(ROOT, outDir)}/`
    )
    console.log(`Blocked hosts: ${summary.blockedHosts.join(', ') || 'none'}`)
    if (summary.mockUnmatched.length) console.log(`Mock had no handler for: ${summary.mockUnmatched.join(', ')}`)
    if (noisy.length) console.log(`Captures with console errors: ${noisy.map((c) => c.file).join(', ')}`)
    if (reloads.length) console.log(`WARNING: the dev server reloaded during the capture: ${reloads.join(' | ')}`)
    if (errored.length) {
      console.log(
        `Failed: ${errored.map((c) => `${c.route}${c.state ? `--${c.state}` : ''}-${c.viewport}-${c.mode}`).join(', ')}`
      )
      process.exitCode = 1
    }
    if (opts.stress) {
      const report = Object.fromEntries(captures.filter((c) => c.stress).map((c) => [c.file, c.stress]))
      fs.writeFileSync(path.join(outDir, 'stress-report.json'), `${JSON.stringify(report, null, 2)}\n`)
      if (checkStress(captures, { update: opts.updateStressBaseline })) process.exitCode = 1
    }
    if (opts.a11y) {
      const report = Object.fromEntries(captures.filter((c) => c.a11y).map((c) => [c.file, c.a11y]))
      fs.writeFileSync(path.join(outDir, 'a11y-report.json'), `${JSON.stringify(report, null, 2)}\n`)
      // Expected names already keep a failed capture's entry; skipping the prune when one failed is extra caution.
      const failed = captures.filter((c) => c.error).length
      const prune = opts.fullRun && opts.updateA11yBaseline
      if (prune && failed) console.warn(`Not pruning the a11y baseline: ${failed} capture(s) failed.`)
      const expected =
        prune && !failed ? captureNames({ viewports: DEFAULT_VIEWPORTS, modes: DEFAULT_MODES }) : undefined
      if (checkA11y(captures, { update: opts.updateA11yBaseline, expected })) process.exitCode = 1
    }
  } finally {
    await cleanup()
  }
}

main().catch((e) => {
  // An interrupted run ends in its signal handler, which exits 130 once the cleanup is done.
  if (interrupted) return
  console.error(e instanceof SnapshotError ? `ui:snapshot: ${e.message}` : e)
  process.exit(1)
})
