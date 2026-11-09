import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const scriptPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'integration-failure.sh')

let dir: string

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'integration-failure-'))
})

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true })
})

function run(step: string, log?: string) {
  const args = [scriptPath, step]
  if (log !== undefined) {
    const file = path.join(dir, 'step.log')
    fs.writeFileSync(file, log)
    args.push(file)
  }
  const res = spawnSync('bash', args, { encoding: 'utf8' })
  return { status: res.status, stdout: res.stdout, stderr: res.stderr }
}

const lines = (n: number, prefix = 'line') => Array.from({ length: n }, (_, i) => `${prefix} ${i + 1}`).join('\n')

describe('integration-failure.sh', () => {
  it('prints the step name, then the last 60 lines of an ordinary step', () => {
    const res = run('Build app against the stack', `${lines(100)}\n`)
    expect(res.status).toBe(0)
    expect(res.stderr).toBe('')
    const out = res.stdout.split('\n')
    expect(out[0]).toBe('Build app against the stack')
    expect(out.slice(1, -1)).toEqual(lines(100).split('\n').slice(-60))
  })

  it('keeps the Playwright failure section from the first "1) " line to the end', () => {
    const log = [
      'Running 3 tests',
      '  ok 1 [chromium] › a.e2e.ts:1:1 › passes',
      '  1) [chromium] › b.e2e.ts:4:5 › fails',
      '',
      '    Error: expected 1 to be 2',
      '',
      '  2 failed',
      '    [chromium] › c.e2e.ts:9:1',
      '',
    ].join('\n')
    const res = run('Run end-to-end suite (desktop + mobile)', log)
    expect(res.status).toBe(0)
    expect(res.stdout).toBe(
      [
        'Run end-to-end suite (desktop + mobile)',
        '  1) [chromium] › b.e2e.ts:4:5 › fails',
        '',
        '    Error: expected 1 to be 2',
        '',
        '  2 failed',
        '    [chromium] › c.e2e.ts:9:1',
        '',
      ].join('\n')
    )
  })

  it('falls back to the last 60 lines when a Playwright log has no failure list', () => {
    const res = run('Run end-to-end suite (desktop + mobile)', `${lines(80)}\n`)
    expect(res.stdout.split('\n').slice(1, -1)).toEqual(lines(80).split('\n').slice(-60))
  })

  it('strips ANSI colour codes and GitHub workflow command lines', () => {
    const log = [
      '##[group]Run pnpm test:e2e',
      '\u001b[31mError:\u001b[0m boom',
      '::error::something',
      '\u001b[1;32mok\u001b[22m',
      '##[error]Process completed with exit code 1.',
      '',
    ].join('\n')
    const res = run('Run end-to-end suite', log)
    expect(res.stdout).toBe('Run end-to-end suite\nError: boom\nok\n')
    expect(res.stdout).not.toContain('\u001b')
  })

  it('caps the excerpt at 30000 bytes and keeps the end', () => {
    // Sixty 1000-byte lines: the tail alone is over the cap.
    const long = Array.from({ length: 2000 }, (_, i) => `${i} ${'x'.repeat(1000)}`).join('\n')
    const res = run('Build app against the stack', `${long}\n`)
    const out = res.stdout
    expect(Buffer.byteLength(out)).toBeLessThanOrEqual(30000)
    expect(out.startsWith('Build app against the stack\n…(truncated)\n')).toBe(true)
    expect(out.trimEnd().endsWith('1999 ' + 'x'.repeat(1000))).toBe(true)
  })

  it('keeps the capped excerpt valid UTF-8 when the cut lands inside a character', () => {
    const log = Array.from({ length: 60 }, () => '€'.repeat(1000)).join('\n') + '\n'
    fs.writeFileSync(path.join(dir, 'step.log'), log)
    const res = spawnSync('bash', [scriptPath, 'Build app against the stack', path.join(dir, 'step.log')])
    expect(res.status).toBe(0)
    const out = res.stdout as Buffer
    expect(out.length).toBeLessThanOrEqual(30000)
    // fatal: throws on invalid UTF-8, which a lossy decode would hide.
    const text = new TextDecoder('utf-8', { fatal: true }).decode(out)
    expect(text.split('\n').slice(0, 2)).toEqual(['Build app against the stack', '…(truncated)'])
    expect(text.trimEnd().endsWith('€'.repeat(1000))).toBe(true)
  })

  it('says so when no log was captured', () => {
    const missing = spawnSync('bash', [scriptPath, 'Start stack', path.join(dir, 'absent.log')], { encoding: 'utf8' })
    expect(missing.status).toBe(0)
    expect(missing.stdout).toBe('Start stack\nno log was captured for this step.\n')
    expect(run('Start stack', '').stdout).toBe('Start stack\nno log was captured for this step.\n')
  })

  it('says so when no log argument is given', () => {
    const res = run('Start stack')
    expect(res.stdout).toBe('Start stack\nno log was captured for this step.\n')
  })
})
