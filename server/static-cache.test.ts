import express from 'express'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { staticCacheHeaders } from './static-cache.mjs'

const IMMUTABLE = 'public, max-age=31536000, immutable'

describe('staticCacheHeaders', () => {
  let server: Server
  let base: string
  let root: string

  beforeAll(async () => {
    root = mkdtempSync(join(tmpdir(), 'static-cache-'))
    mkdirSync(join(root, 'assets/chunks'), { recursive: true })
    writeFileSync(join(root, 'assets/chunks/chunk-Cg13UnLT.js'), 'x')
    writeFileSync(join(root, 'assets/chunks/index-DxK2a9_B.css'), 'x')
    mkdirSync(join(root, 'assets/entries'), { recursive: true })
    writeFileSync(join(root, 'assets/entries/entry-client-routing.DLymVAZH.js'), 'x')
    writeFileSync(join(root, 'assets/vocdoni_icon.png'), 'x')
    writeFileSync(join(root, 'assets/gitcoin-passport.png'), 'x')
    mkdirSync(join(root, 'assets/static'), { recursive: true })
    writeFileSync(join(root, 'assets/static/inter-latin-400-normal.C38fXH4l.woff2'), 'x')
    writeFileSync(join(root, 'favicon.ico'), 'x')
    writeFileSync(join(root, 'index-DxK2a9_B.js'), 'x')
    const app = express()
    app.use(express.static(root, { index: false, setHeaders: staticCacheHeaders }))
    server = app.listen(0)
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  })

  afterAll(() => {
    server.close()
    rmSync(root, { recursive: true, force: true })
  })

  const cacheControl = async (path: string) => (await fetch(base + path)).headers.get('cache-control')

  it('marks hashed files under /assets/ immutable for a year', async () => {
    expect(await cacheControl('/assets/chunks/chunk-Cg13UnLT.js')).toBe(IMMUTABLE)
    expect(await cacheControl('/assets/chunks/index-DxK2a9_B.css')).toBe(IMMUTABLE)
    expect(await cacheControl('/assets/static/inter-latin-400-normal.C38fXH4l.woff2')).toBe(IMMUTABLE)
    // Vike's entries and static files use a dot before the hash.
    expect(await cacheControl('/assets/entries/entry-client-routing.DLymVAZH.js')).toBe(IMMUTABLE)
  })

  it('keeps the default for unhashed files in /assets/', async () => {
    expect(await cacheControl('/assets/vocdoni_icon.png')).toBe('public, max-age=0')
    // "-passport" looks like a hash, but public/ files sit directly under /assets/.
    expect(await cacheControl('/assets/gitcoin-passport.png')).toBe('public, max-age=0')
  })

  it('keeps the default for files outside /assets/', async () => {
    expect(await cacheControl('/favicon.ico')).toBe('public, max-age=0')
    expect(await cacheControl('/index-DxK2a9_B.js')).toBe('public, max-age=0')
  })
})
