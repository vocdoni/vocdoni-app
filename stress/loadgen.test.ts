import { execFile } from 'node:child_process'
import { createServer, type RequestListener, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const script = path.resolve(__dirname, 'loadgen.mjs')
const servers: Server[] = []

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve) => {
          server.closeAllConnections()
          server.close(() => resolve())
        })
    )
  )
})

async function listen(handler: RequestListener, host = '127.0.0.1') {
  const server = createServer(handler)
  servers.push(server)
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, host, () => resolve())
  })
  const { port } = server.address() as AddressInfo
  return `http://${host.includes(':') ? `[${host}]` : host}:${port}/`
}

function run(args: string[]) {
  return new Promise<{ code: number | string; stdout: string; stderr: string }>((resolve) => {
    execFile(process.execPath, [script, ...args], { timeout: 2000 }, (error, stdout, stderr) => {
      resolve({ code: error ? error.code || error.signal || 1 : 0, stdout, stderr })
    })
  })
}

function result(stdout: string) {
  const line = stdout.split('\n').find((line) => line.startsWith('RESULT_JSON '))
  expect(line).toBeDefined()
  return JSON.parse(line!.slice('RESULT_JSON '.length))
}

describe('load generator CLI', () => {
  it.each([
    ['--concurrency', '0'],
    ['--concurrency', 'oops'],
    ['--concurrency', '1.5'],
    ['--duration', '0'],
    ['--duration', '-1'],
    ['--duration', 'NaN'],
    ['--timeout', '0'],
    ['--timeout', 'Infinity'],
    ['--warmup', '-1'],
  ])('rejects invalid %s %s instead of producing a successful empty run', async (flag, value) => {
    const output = await run(['--url', 'http://127.0.0.1:1/', '--duration', '0.01', flag, value])
    expect(output.code).not.toBe(0)
    expect(output.stdout).not.toContain('RESULT_JSON ')
    expect(output.stderr).toContain(flag)
  })

  it('times out a continuously streaming response exactly once', async () => {
    const url = await listen((_request, response) => {
      response.writeHead(200)
      response.write('start')
      const interval = setInterval(() => response.write('chunk'), 10)
      response.on('close', () => clearInterval(interval))
    })
    const output = await run(['--url', url, '--concurrency', '1', '--duration', '0.05', '--timeout', '100'])
    expect(output.code).toBe(0)
    const measured = result(output.stdout)
    expect(measured.requests).toBe(1)
    expect(measured.errors).toBe(1)
    expect(measured.errorBreakdown).toEqual({ ETIMEDOUT: 1 })
    expect(measured.ok2xx).toBe(0)
  })

  it('connects to an IPv6 literal rather than resolving its brackets as DNS', async (context) => {
    let url: string
    try {
      url = await listen((_request, response) => response.end('ok'), '::1')
    } catch (error) {
      if (['EAFNOSUPPORT', 'EADDRNOTAVAIL'].includes((error as NodeJS.ErrnoException).code || '')) {
        context.skip('IPv6 loopback unavailable')
        return
      }
      throw error
    }
    const output = await run(['--url', url, '--concurrency', '1', '--duration', '0.05'])
    expect(output.code).toBe(0)
    const measured = result(output.stdout)
    expect(measured.ok2xx).toBeGreaterThan(0)
    expect(measured.errors).toBe(0)
  })

  it('excludes a warmup failure that completes after measurement starts', async () => {
    let requests = 0
    const url = await listen((_request, response) => {
      if (++requests === 1) {
        setTimeout(() => {
          response.statusCode = 500
          response.end('cold start')
        }, 150)
      } else {
        response.end('ok')
      }
    })
    const output = await run(['--url', url, '--concurrency', '1', '--warmup', '0.05', '--duration', '0.3'])
    expect(output.code).toBe(0)
    const measured = result(output.stdout)
    expect(measured.ok2xx).toBeGreaterThan(0)
    expect(measured.non2xx).toBe(0)
    expect(measured.requests).toBe(measured.ok2xx)
    expect(measured.statusBuckets['500']).toBeUndefined()
  })

  it('reports no measured requests when only an in-flight warmup request completes', async () => {
    const url = await listen((_request, response) => setTimeout(() => response.end('ok'), 150))
    const output = await run(['--url', url, '--concurrency', '1', '--warmup', '0.05', '--duration', '0.02'])
    expect(output.code).toBe(0)
    const measured = result(output.stdout)
    expect(measured.requests).toBe(0)
    expect(measured.ok2xx).toBe(0)
    expect(measured.rps).toBe(0)
    expect(measured.latencyMs.max).toBe(0)
  })

  it('clears completed-request deadlines before reusing keep-alive sockets', async () => {
    const url = await listen((_request, response) => setTimeout(() => response.end('ok'), 10))
    const output = await run(['--url', url, '--concurrency', '1', '--duration', '0.3', '--timeout', '100'])
    expect(output.code).toBe(0)
    const measured = result(output.stdout)
    expect(measured.ok2xx).toBeGreaterThan(1)
    expect(measured.errors).toBe(0)
  })
})
