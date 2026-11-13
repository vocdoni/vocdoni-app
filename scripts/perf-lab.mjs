#!/usr/bin/env node
/**
 * Repeatable page-load baseline: loads URLs in headless Chrome, with and without
 * CDP throttling, and reports the median of N runs.
 *
 *   pnpm perf:lab -- --url https://app.vocdoni.io/ \
 *     --url https://app.vocdoni.io/en/account/signin --ready 'input[type="email"]'
 *
 * Run `pnpm perf:lab -- --help` for every option. Lab numbers are for before/after
 * comparisons on one machine, not absolute truth. Needs Google Chrome installed.
 */
import { chromium } from '@playwright/test'
import fs from 'node:fs'
import { blockingTime, formatTable, parseArgs, PROFILES, summarize, typeBucket, USAGE } from './perf-lab-lib.mjs'

// Collects paint, LCP and long tasks from the first moment of every document.
const OBSERVER = `
  window.__perf = { origin: performance.timeOrigin, fcp: null, lcp: null, longTasks: [] }
  const observe = (type, cb) => {
    try { new PerformanceObserver((l) => l.getEntries().forEach(cb)).observe({ type, buffered: true }) } catch {}
  }
  observe('paint', (e) => { if (e.name === 'first-contentful-paint') window.__perf.fcp = e.startTime })
  observe('largest-contentful-paint', (e) => { window.__perf.lcp = e.startTime })
  observe('longtask', (e) => window.__perf.longTasks.push(e.duration))
`
const READY_TIMEOUT = 60_000
const SETTLE_MS = 1000

async function measure(browser, target, profile, storageState) {
  const context = await browser.newContext({ storageState, locale: 'en-US', viewport: { width: 1280, height: 800 } })
  try {
    await context.addInitScript(OBSERVER)
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    const types = new Map()
    const bytes = { js: 0, fonts: 0, other: 0 }
    await cdp.send('Network.enable')
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
    const { frameTree } = await cdp.send('Page.getFrameTree')
    const mainFrameId = frameTree.frame.id
    const documentIds = new Set()
    cdp.on('Network.requestWillBeSent', (e) => {
      types.set(e.requestId, e.type)
      // A redirect chain reuses the request id, so each document counts once.
      if (e.type === 'Document' && e.frameId === mainFrameId) documentIds.add(e.requestId)
    })
    cdp.on('Network.loadingFinished', (e) => {
      bytes[typeBucket(types.get(e.requestId))] += e.encodedDataLength
    })
    const p = PROFILES[profile]
    if (p.latency || p.downKbps) {
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: p.latency,
        downloadThroughput: (p.downKbps * 1000) / 8,
        uploadThroughput: (p.upKbps * 1000) / 8,
      })
    }
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: p.cpu })

    const startEpoch = Date.now()
    const start = performance.now()
    await page.goto(target.url, { waitUntil: 'commit', timeout: READY_TIMEOUT })
    if (target.ready) await page.waitForSelector(target.ready, { state: 'visible', timeout: READY_TIMEOUT })
    // Without a ready selector, wait for the network to go quiet so redirects and lazy chunks are included.
    else await page.waitForLoadState('networkidle', { timeout: READY_TIMEOUT })
    const readyMs = performance.now() - start
    await page.waitForTimeout(SETTLE_MS)
    const perf = await page.evaluate(() => window.__perf)
    return {
      readyMs,
      documents: documentIds.size,
      // From the start of the first navigation, so a redirect to a second document counts
      fcp: perf.fcp == null ? null : perf.origin + perf.fcp - startEpoch,
      lcp: perf.lcp == null ? null : perf.origin + perf.lcp - startEpoch,
      blockingMs: blockingTime(perf.longTasks),
      longTasks: perf.longTasks.length,
      jsBytes: bytes.js,
      fontBytes: bytes.fonts,
      otherBytes: bytes.other,
    }
  } finally {
    await context.close()
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2), (f) => fs.readFileSync(f, 'utf8'))
  if (opts.help) return console.log(USAGE)
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const rows = []
  try {
    for (const target of opts.targets) {
      for (const profile of opts.profiles) {
        const runs = []
        for (let i = 0; i < opts.runs; i++) {
          runs.push(await measure(browser, target, profile, opts.storageState))
          console.error(`${target.url} [${profile}] run ${i + 1}/${opts.runs}`)
        }
        rows.push({ url: target.url, profile, runs: opts.runs, ...summarize(runs) })
      }
    }
  } finally {
    await browser.close()
  }
  console.log(opts.json ? JSON.stringify(rows, null, 2) : formatTable(rows))
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
