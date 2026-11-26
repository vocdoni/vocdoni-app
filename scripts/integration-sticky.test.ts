import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const scriptPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'integration-sticky.sh')

type Comment = { body: string; user: { login: string } }

// A fake `gh` on PATH: answers `repos/<repo>/collaborators/<login>/permission`
// from FAKE_PERMS ("login=permission,..."), exits 1 for unknown logins, and
// appends each lookup to FAKE_GH_LOG so the tests can count them.
const fakeGh = `#!/usr/bin/env bash
case "$2" in
  repos/*/collaborators/*/permission)
    login="\${2#*/collaborators/}"
    login="\${login%/permission}"
    ;;
  *) echo "fake gh: unexpected $*" >&2; exit 2 ;;
esac
echo "$login" >> "$FAKE_GH_LOG"
for pair in \${FAKE_PERMS//,/ }; do
  if [ "\${pair%%=*}" = "$login" ]; then
    echo "\${pair#*=}"
    exit 0
  fi
done
echo "HTTP 404: Not Found" >&2
exit 1
`

const PERMS = 'alice=write,bob=read,carol=maintain'

let binDir = ''
let logPath = ''

beforeAll(() => {
  binDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sticky-gh-'))
  logPath = path.join(binDir, 'calls.log')
  fs.writeFileSync(path.join(binDir, 'gh'), fakeGh, { mode: 0o755 })
})

afterAll(() => {
  fs.rmSync(binDir, { recursive: true, force: true })
})

function run(comments: Comment[], env: Record<string, string> = {}) {
  return spawnSync('bash', [scriptPath], {
    input: JSON.stringify(comments),
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${binDir}${path.delimiter}${process.env.PATH ?? ''}`,
      REPO: 'owner/repo',
      FAKE_PERMS: PERMS,
      FAKE_GH_LOG: logPath,
      ...env,
    },
  })
}

function sticky(comments: Comment[]) {
  const res = run(comments)
  expect(res.status, res.stderr).toBe(0)
  expect(res.stderr).toBe('')
  return res.stdout
}

function refs(sequencer: string, saas: string, sdk = '', isSticky = sequencer + saas + sdk !== '') {
  return `vocdoni_sequencer_ref=${sequencer}\nsaas_backend_ref=${saas}\nintegrator_sdk_ref=${sdk}\nsticky=${isSticky}\n`
}

const WRITER = 'alice'
const MAINTAINER = 'carol'
const READER = 'bob'

describe('integration-sticky.sh', () => {
  it('empty array has no sticky state', () => {
    expect(sticky([])).toBe(refs('', ''))
  })

  it('a sticky comment sets the state', () => {
    expect(sticky([{ body: '/integration saas-backend=#760', user: { login: WRITER } }])).toBe(refs('', '#760'))
  })

  it('a bare PR number comment sets the state as #N', () => {
    expect(sticky([{ body: '/integration saas-backend=760', user: { login: WRITER } }])).toBe(refs('', '#760'))
  })

  it('a SHA-only comment does not change the state', () => {
    expect(
      sticky([
        { body: '/integration saas-backend=#760', user: { login: WRITER } },
        { body: '/integration vocdoni-sequencer=1a2b3c4', user: { login: WRITER } },
      ])
    ).toBe(refs('', '#760'))
  })

  it('reset clears the state', () => {
    expect(
      sticky([
        { body: '/integration saas-backend=#760', user: { login: WRITER } },
        { body: '/integration reset', user: { login: WRITER } },
      ])
    ).toBe(refs('', ''))
  })

  it('reset clears the integrator-sdk ref too', () => {
    expect(
      sticky([
        { body: '/integration vocdoni-sequencer=feat/a integrator-sdk=#88', user: { login: WRITER } },
        { body: '/integration reset', user: { login: WRITER } },
      ])
    ).toBe(refs('', '', ''))
  })

  it('a later sticky comment replaces the earlier one', () => {
    expect(
      sticky([
        { body: '/integration vocdoni-sequencer=feat/a saas-backend=#1', user: { login: WRITER } },
        { body: '/integration saas-backend=#2', user: { login: WRITER } },
      ])
    ).toBe(refs('', '#2'))
  })

  it('a sticky comment with the integrator-sdk ref sets it', () => {
    expect(sticky([{ body: '/integration integrator-sdk=#88', user: { login: WRITER } }])).toBe(refs('', '', '#88'))
  })

  it('a sticky comment replaces all three refs, not just the ones it names', () => {
    expect(
      sticky([
        {
          body: '/integration vocdoni-sequencer=feat/a saas-backend=#1 integrator-sdk=main',
          user: { login: WRITER },
        },
        { body: '/integration integrator-sdk=release/1.0.0', user: { login: WRITER } },
      ])
    ).toBe(refs('', '', 'release/1.0.0'))
  })

  it('a bare /integration is sticky with no refs', () => {
    expect(sticky([{ body: '/integration', user: { login: WRITER } }])).toBe(refs('', '', '', true))
  })

  it('a bare /integration after a pinned comment drops the pins and stays sticky', () => {
    expect(
      sticky([
        {
          body: '/integration vocdoni-sequencer=feat/a saas-backend=#760 integrator-sdk=main',
          user: { login: WRITER },
        },
        { body: '/integration', user: { login: WRITER } },
      ])
    ).toBe(refs('', '', '', true))
  })

  it('a pinned comment after a bare /integration sets the pins', () => {
    expect(
      sticky([
        { body: '/integration', user: { login: WRITER } },
        { body: '/integration saas-backend=760', user: { login: WRITER } },
      ])
    ).toBe(refs('', '#760'))
  })

  it('a SHA-only comment after a bare /integration keeps it sticky', () => {
    expect(
      sticky([
        { body: '/integration', user: { login: WRITER } },
        { body: '/integration vocdoni-sequencer=1a2b3c4', user: { login: WRITER } },
      ])
    ).toBe(refs('', '', '', true))
  })

  it('reset after a bare /integration clears the sticky state', () => {
    expect(
      sticky([
        { body: '/integration', user: { login: WRITER } },
        { body: '/integration reset', user: { login: WRITER } },
      ])
    ).toBe(refs('', ''))
  })

  it('a read-only user bare /integration is ignored', () => {
    expect(sticky([{ body: '/integration', user: { login: READER } }])).toBe(refs('', ''))
  })

  it('a writer sticky comment counts', () => {
    expect(sticky([{ body: '/integration vocdoni-sequencer=feat/a', user: { login: WRITER } }])).toBe(
      refs('feat/a', '')
    )
  })

  it('a maintain sticky comment counts', () => {
    expect(sticky([{ body: '/integration vocdoni-sequencer=feat/a', user: { login: MAINTAINER } }])).toBe(
      refs('feat/a', '')
    )
  })

  it('a read-only user sticky comment is ignored', () => {
    expect(sticky([{ body: '/integration vocdoni-sequencer=feat/b', user: { login: READER } }])).toBe(refs('', ''))
  })

  it('a read-only user reset is ignored', () => {
    expect(
      sticky([
        { body: '/integration saas-backend=#760', user: { login: WRITER } },
        { body: '/integration reset', user: { login: READER } },
      ])
    ).toBe(refs('', '#760'))
  })

  it('an unknown login is ignored with a warning, not a failure', () => {
    const res = run([
      { body: '/integration vocdoni-sequencer=feat/a', user: { login: 'mallory' } },
      { body: '/integration saas-backend=#760', user: { login: WRITER } },
    ])
    expect(res.status, res.stderr).toBe(0)
    expect(res.stderr).toContain("::warning::could not check mallory's permission")
    expect(res.stdout).toBe(refs('', '#760'))
  })

  it('looks up each login once', () => {
    fs.rmSync(logPath, { force: true })
    expect(
      sticky([
        { body: '/integration vocdoni-sequencer=feat/a', user: { login: WRITER } },
        { body: '/integration vocdoni-sequencer=feat/b', user: { login: WRITER } },
        { body: 'just chatting', user: { login: READER } },
      ])
    ).toBe(refs('feat/b', ''))
    expect(fs.readFileSync(logPath, 'utf8').trim().split('\n')).toEqual([WRITER])
  })

  it('fails with usage when REPO is unset', () => {
    const env = { ...process.env }
    delete env.REPO
    const res = spawnSync('bash', [scriptPath], { input: '[]', encoding: 'utf8', env })
    expect(res.status).toBe(1)
    expect(res.stderr).toContain('usage: REPO=owner/repo')
  })

  it('ignores malformed /integration comments', () => {
    const res = run([
      { body: '/integration saas-backend=#760', user: { login: WRITER } },
      { body: '/integration saas-backend=#abc', user: { login: WRITER } },
      { body: '/integration integrator-sdk=#1 integrator-sdk=#2', user: { login: WRITER } },
      { body: '/integration reset now', user: { login: WRITER } },
      { body: 'just chatting', user: { login: WRITER } },
    ])
    expect(res.status, res.stderr).toBe(0)
    expect(res.stdout).toBe(refs('', '#760'))
    expect(res.stderr.match(/::warning::Ignoring \/integration comment/g)).toHaveLength(3)
  })

  it('warns about a comment the parser rejects, naming the reason, and skips it', () => {
    const res = run([
      { body: '/integration saas-backend=700', user: { login: WRITER } },
      { body: '/integration vocdoni-node=#12 saas-backend=760', user: { login: WRITER } },
    ])
    expect(res.status, res.stderr).toBe(0)
    expect(res.stdout).toBe(refs('', '#700'))
    expect(res.stderr).toContain('::warning::Ignoring /integration comment: ERROR: vocdoni-node is no longer used')
  })

  it('reads the first line of a multi-line body', () => {
    expect(
      sticky([
        {
          body: '/integration vocdoni-sequencer=feat/a\n\nSome notes with `backticks` and "quotes",\n/integration reset',
          user: { login: WRITER },
        },
      ])
    ).toBe(refs('feat/a', ''))
  })

  it('accepts a valid first line followed by a body over 70000 bytes', () => {
    const body = `/integration saas-backend=#760\n${'x'.repeat(70000)}`
    expect(sticky([{ body, user: { login: WRITER } }])).toBe(refs('', '#760'))
  })
})
