import { spawn, type ChildProcess } from 'node:child_process'
import fs from 'node:fs'
import { createServer, type AddressInfo } from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

const ENTRY = path.resolve(__dirname, 'index.mjs')
let dist: string
// Every server a test starts, so a failed or timed-out test cannot leave one listening.
const children: ChildProcess[] = []

// The production entry imports the built SSR bundle, so the test gives it an empty one.
beforeAll(() => {
  dist = fs.mkdtempSync(path.join(os.tmpdir(), 'server-index-test-'))
  fs.mkdirSync(path.join(dist, 'server'))
  fs.mkdirSync(path.join(dist, 'client'))
  fs.writeFileSync(path.join(dist, 'server', 'entry.mjs'), 'export {}\n')
})

afterEach(() => {
  for (const child of children.splice(0)) if (child.exitCode === null && child.signalCode === null) child.kill()
})

afterAll(() => {
  fs.rmSync(dist, { recursive: true, force: true })
})

const spawnServer = (port: number) => {
  const child = spawn(process.execPath, [ENTRY], {
    env: { ...process.env, NODE_ENV: 'production', PORT: String(port), DIST_DIR: dist, UI_SNAPSHOT_HOST: '127.0.0.1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  children.push(child)
  return child
}

const freePort = async () => {
  const probe = createServer()
  await new Promise<void>((resolve) => probe.listen(0, '127.0.0.1', resolve))
  const { port } = probe.address() as AddressInfo
  await new Promise<void>((resolve) => probe.close(() => resolve()))
  return port
}

describe('server entry point', () => {
  it('exits non-zero without claiming to run when the port is taken', async () => {
    const blocker = createServer()
    await new Promise<void>((resolve) => blocker.listen(0, '127.0.0.1', resolve))
    const { port } = blocker.address() as AddressInfo
    try {
      const child = spawnServer(port)
      let stdout = ''
      let stderr = ''
      child.stdout.on('data', (chunk) => (stdout += chunk))
      child.stderr.on('data', (chunk) => (stderr += chunk))
      const code = await new Promise<number | null>((resolve) => child.once('close', resolve))
      expect(code).toBe(1)
      expect(stderr).toContain('EADDRINUSE')
      expect(stdout).not.toContain('Server running at')
    } finally {
      await new Promise<void>((resolve) => blocker.close(() => resolve()))
    }
  }, 30_000)

  it('prints the running line once the port is bound', async () => {
    const port = await freePort()
    const child = spawnServer(port)
    try {
      let stdout = ''
      await new Promise<void>((resolve, reject) => {
        child.stdout.on('data', (chunk) => {
          stdout += chunk
          if (stdout.includes('Server running at')) resolve()
        })
        child.once('close', (code) => reject(new Error(`the server exited with ${code}`)))
      })
      expect(stdout).toContain(`Server running at http://localhost:${port}`)
    } finally {
      child.kill()
    }
  }, 30_000)
})
