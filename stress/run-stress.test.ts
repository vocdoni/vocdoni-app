import { execFile } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { afterEach, describe, expect, it } from 'vitest'

const script = path.resolve(__dirname, 'run-stress.sh')
const directories: string[] = []

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

const successfulResult = {
  label: 'fixture',
  url: 'http://localhost:3000/en',
  concurrency: 1,
  durationSeconds: 1,
  keepalive: true,
  requests: 100,
  rps: 100,
  ok2xx: 100,
  redirect3xx: 0,
  non2xx: 0,
  errors: 0,
  errorBreakdown: {},
  statusBuckets: { '2xx': 100 },
  bytesReceived: 200,
  latencyMs: { min: 1, avg: 1, p50: 1, p90: 1, p99: 1, max: 1 },
}

// Keep the real orchestration and JSON parser; replace Docker/network/process
// boundaries so startup, crashes and resource failures need no Docker daemon.
async function harness(scenario = '', measurement = successfulResult, levels = '1') {
  const root = await mkdtemp(path.join(tmpdir(), 'stress-test-'))
  directories.push(root)
  const bin = path.join(root, 'bin')
  await mkdir(bin)
  await mkdir(path.join(root, 'stress'))
  await copyFile(script, path.join(root, 'stress/run-stress.sh'))
  const prelude = `#!${process.execPath}
const fs = require('node:fs');
const root = process.env.FIXTURE_ROOT;
const args = process.argv.slice(2);
const scenario = process.env.FIXTURE_SCENARIO;
`
  const commands: Record<string, string> = {
    docker: `${prelude}
if (args[0] === 'run') {
  if (scenario === 'startup-failure') process.exit(125);
  fs.writeFileSync(root + '/container', args[args.indexOf('--name') + 1]);
} else if (args[0] === 'ps') {
  if (fs.existsSync(root + '/container') && !fs.existsSync(root + '/dead'))
    console.log(fs.readFileSync(root + '/container', 'utf8'));
} else if (args[0] === 'inspect') {
  console.log(args.includes('{{.RestartCount}}') ? '0' : 'false');
} else if (args[0] === 'stats') {
  console.log('fixture cpu=10% mem=20MiB / 512MiB (4%) net=0B / 0B pids=1');
} else if (args[0] === 'logs') {
  fs.writeFileSync(root + '/log-request', JSON.stringify(args));
}
`,
    curl: `${prelude}
fs.writeFileSync(root + '/readiness-requested', 'yes');
process.stdout.write(scenario === 'redirect' ? '307' : '200');
`,
    sleep: `${prelude}
if (args[0] === '3' && scenario === 'cooldown-death') fs.writeFileSync(root + '/dead', 'yes');
setTimeout(() => {}, 20);
`,
    node: `${prelude}
if (args[0].endsWith('/loadgen.mjs')) {
  fs.writeFileSync(root + '/loadgen-started', 'yes');
  if (scenario === 'generator-failure') process.exit(1);
  const output = () => console.log('RESULT_JSON ' + process.env.FIXTURE_RESULT);
  if (scenario === 'signal') setTimeout(output, 400);
  else output();
} else {
  const result = require('node:child_process').spawnSync(process.execPath, args, { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}
`,
  }
  await Promise.all(
    Object.entries(commands).map(([name, content]) => writeFile(path.join(bin, name), content, { mode: 0o755 }))
  )
  let child: ReturnType<typeof execFile>
  const completed = new Promise<{ code: number | string; stdout: string; stderr: string }>((resolve) => {
    child = execFile(
      'bash',
      [path.join(root, 'stress/run-stress.sh'), '--skip-build', '--levels', levels, '--keep'],
      {
        timeout: 4000,
        env: {
          ...process.env,
          PATH: `${bin}:${process.env.PATH}`,
          FIXTURE_ROOT: root,
          FIXTURE_SCENARIO: scenario,
          FIXTURE_RESULT: JSON.stringify(measurement),
        },
      },
      (error, stdout, stderr) => resolve({ code: error ? error.code || error.signal || 1 : 0, stdout, stderr })
    )
  })
  return { root, child: child!, completed }
}

describe('stress ramp orchestration', () => {
  it('aborts a failed container startup before accepting another service readiness', async () => {
    const run = await harness('startup-failure')
    const output = await run.completed
    expect(output.code).not.toBe(0)
    expect(existsSync(path.join(run.root, 'readiness-requested'))).toBe(false)
    expect(output.stdout).not.toContain('survived')
  })

  it.each(['1 2', '1'])('records container death during cooldown for levels %s', async (levels) => {
    const { completed } = await harness('cooldown-death', successfulResult, levels)
    const output = await completed
    expect(output.stdout).toContain('First failing concurrency level: 1')
    expect(output.stdout).not.toContain('survived')
  })

  it.each([
    [1000, 'OK'],
    [10000, 'DEGRADED'],
  ])('classifies %s/100001 failures without rounding to the next threshold', async (errors, expected) => {
    const { completed } = await harness('', {
      ...successfulResult,
      requests: 100001,
      ok2xx: 100001 - errors,
      errors,
      errorBreakdown: { ETIMEDOUT: errors },
      statusBuckets: { '2xx': 100001 - errors },
    })
    const output = await completed
    expect(output.code).toBe(0)
    const row = output.stdout.split('\n').find((line) => /^1\s/.test(line))
    expect(row?.trim().split(/\s+/).at(-1)).toBe(expected)
  })

  it('reports client resource exhaustion as an invalid benchmark, not a server crash', async () => {
    const { completed } = await harness('', {
      ...successfulResult,
      ok2xx: 10,
      errors: 90,
      errorBreakdown: { EMFILE: 90 },
      statusBuckets: { '2xx': 10 },
    })
    const output = await completed
    expect(output.code).not.toBe(0)
    expect(output.stdout).toMatch(/invalid|client.limit|generator/i)
    expect(output.stdout).not.toContain('First failing concurrency level')
    expect(output.stdout).not.toContain('survived')
  })

  it('does not attribute a generator process failure to the server', async () => {
    const { completed } = await harness('generator-failure')
    const output = await completed
    expect(output.code).not.toBe(0)
    expect(output.stdout).not.toContain('First failing concurrency level')
  })

  it('rejects an empty measurement instead of classifying it OK', async () => {
    const { completed } = await harness('', {
      ...successfulResult,
      requests: 0,
      ok2xx: 0,
      statusBuckets: { '2xx': 0 },
    })
    const output = await completed
    expect(output.code).not.toBe(0)
    expect(output.stdout).not.toContain('survived')
  })

  it('rejects an empty ramp rather than claiming all levels survived', async () => {
    const { completed } = await harness('', successfulResult, ' ')
    const output = await completed
    expect(output.code).not.toBe(0)
    expect(output.stdout).not.toContain('survived')
  })

  it('makes redirect-only traffic visible without following redirects', async () => {
    const { completed } = await harness('redirect', {
      ...successfulResult,
      ok2xx: 0,
      redirect3xx: 100,
      statusBuckets: { '2xx': 0 },
    })
    const output = await completed
    expect(output.code).toBe(0)
    expect(output.stdout).toMatch(/redirect.*not.follow|not.follow.*redirect/i)
    expect(output.stdout).toContain('3xx')
  })

  it('requests bounded diagnostic logs from Docker instead of transferring the entire history', async () => {
    const run = await harness('', {
      ...successfulResult,
      ok2xx: 90,
      errors: 10,
      errorBreakdown: { ETIMEDOUT: 10 },
      statusBuckets: { '2xx': 90 },
    })
    const output = await run.completed
    expect(output.stdout).toContain('First failing concurrency level: 1')
    const args = JSON.parse(await readFile(path.join(run.root, 'log-request'), 'utf8'))
    expect(args.slice(1, 3)).toEqual(['--tail', '20'])
  })

  it('terminates on SIGTERM instead of continuing subsequent levels', async () => {
    const run = await harness('signal', successfulResult, '1 2')
    for (let i = 0; i < 100 && !existsSync(path.join(run.root, 'loadgen-started')); i++) await delay(10)
    expect(existsSync(path.join(run.root, 'loadgen-started'))).toBe(true)
    run.child.kill('SIGTERM')
    const output = await run.completed
    expect(output.code).toBe(143)
    expect(output.stdout).not.toContain('survived')
  })
})
