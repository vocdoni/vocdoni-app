import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const scriptPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'integration-report.sh')

const SHA_APP = 'a'.repeat(40)
const SHA_MERGE = 'b'.repeat(40)
const SHA_NODE = 'c'.repeat(40)
const RUN_URL = 'https://github.com/vocdoni/ui-scaffold/actions/runs/1'

function report(env: Record<string, string>) {
  const base = {
    EVENT: 'issue_comment',
    REPO: 'vocdoni/ui-scaffold',
    SERVER_URL: 'https://github.com',
    RUN_URL,
    PARSED: 'true',
    RESOLVE: 'success',
    RESULT: 'success',
    RESET: 'false',
    STICKY: 'false',
    CHECKOUT: SHA_MERGE,
    HEAD_SHA: SHA_APP,
    NODE_REF: '',
    SAAS_REF: '',
    SDK_REF: '',
    NODE_SHA: '',
    SAAS_SHA: '',
    SDK_SHA: '',
    FAILURE: '',
    ERROR: '',
  }
  const res = spawnSync('bash', [scriptPath], {
    input: '',
    encoding: 'utf8',
    env: { PATH: process.env.PATH, ...base, ...env },
  })
  expect(res.stderr).toBe('')
  expect(res.status).toBe(0)
  return res.stdout
}

const appLine = `- App: merge of https://github.com/vocdoni/ui-scaffold/commit/${SHA_APP} (https://github.com/vocdoni/ui-scaffold/commit/${SHA_MERGE})`

describe('integration-report.sh', () => {
  it('reports a successful /integration comment run', () => {
    expect(report({ NODE_REF: '1a2b3c4', NODE_SHA: SHA_NODE, STICKY: 'false' })).toBe(
      [
        '✅ Integration run: **success**',
        '',
        appLine,
        `- vocdoni-node: https://github.com/vocdoni/vocdoni-node/commit/1a2b3c4 → https://github.com/vocdoni/vocdoni-node/commit/${SHA_NODE}`,
        '- saas-backend: :main image',
        '- integrator-sdk: npm (lockfile)',
        `- Run: ${RUN_URL}`,
        '',
        'One-shot run: pushes keep using the previous sticky refs, if any.',
        '',
      ].join('\n')
    )
  })

  it('puts the e2e failure excerpt in a collapsed block with a fence it cannot close', () => {
    const failure = [
      '  1) [chromium] › a.e2e.ts:1:1 › fails',
      '    Error: boom',
      '~~~~~',
      '   ~~~ stray',
      'after',
    ].join('\n')
    const out = report({ RESULT: 'failure', FAILURE: failure })
    expect(out.startsWith('❌ Integration run: **failure**\n')).toBe(true)
    expect(out).toContain(
      [
        '',
        '<details><summary>Failure output</summary>',
        '',
        '~~~~~',
        '  1) [chromium] › a.e2e.ts:1:1 › fails',
        '    Error: boom',
        'after',
        '~~~~~',
        '</details>',
        '',
      ].join('\n')
    )
    expect(out.split('\n').filter((l) => l.startsWith('~~~')).length).toBe(2)
  })

  it('shows the parser error in a rejected reply', () => {
    const out = report({
      PARSED: 'false',
      RESULT: '',
      RESOLVE: '',
      ERROR: "ERROR: invalid ref 'https://x' for 'saas-backend'",
    })
    expect(out).toBe(
      [
        "❌ Integration run: **rejected**: `ERROR: invalid ref 'https://x' for 'saas-backend'`",
        '',
        `- Run: ${RUN_URL}`,
        '',
        '<details><summary>Failure output</summary>',
        '',
        '~~~~~',
        "ERROR: invalid ref 'https://x' for 'saas-backend'",
        '~~~~~',
        '</details>',
        '',
      ].join('\n')
    )
  })

  it('renders the error as inline code, with backticks removed and no mentions', () => {
    const out = report({ PARSED: 'false', RESULT: '', RESOLVE: '', ERROR: 'bad `@user` ref' })
    expect(out.split('\n')[0]).toBe('❌ Integration run: **rejected**: `bad @user ref`')
    const resolveOut = report({ RESOLVE: 'failure', ERROR: 'cc @user `x`' })
    expect(resolveOut.split('\n')[0]).toBe('❌ Integration run: **error** resolving the PR (failure): `cc @user x`')
  })

  it('keeps the generic rejected reply when there is no parser error', () => {
    const out = report({ PARSED: 'false', RESULT: '', RESOLVE: '' })
    expect(out).toBe(
      '❌ Integration run: **rejected**: the `/integration` command could not be parsed, see the run log.\n'
    )
  })

  it('reports a reset', () => {
    expect(report({ RESET: 'true', RESULT: '' })).toBe(
      [
        'Sticky integration refs cleared; pushes use the `:main` images and the npm SDK again.',
        '',
        `- Run: ${RUN_URL}`,
        '',
      ].join('\n')
    )
  })

  it('titles a push run and says where its refs come from', () => {
    const out = report({
      EVENT: 'pull_request',
      CHECKOUT: SHA_MERGE,
      SAAS_REF: '#760',
      SAAS_SHA: SHA_NODE,
      STICKY: 'true',
    })
    expect(out).toBe(
      [
        '✅ Integration run on push: **success**',
        '',
        appLine,
        '- vocdoni-node: :main image',
        `- saas-backend: https://github.com/vocdoni/saas-backend/pull/760 → https://github.com/vocdoni/saas-backend/commit/${SHA_NODE}`,
        '- integrator-sdk: npm (lockfile)',
        `- Run: ${RUN_URL}`,
        '',
        "The refs come from this PR's sticky `/integration` comment, re-resolved on this push.",
        '',
      ].join('\n')
    )
  })

  it('says a push run on stage or main ran unpinned, and includes its failure output', () => {
    const out = report({ EVENT: 'pull_request', RESULT: 'failure', FAILURE: 'Error: boom' })
    expect(out.startsWith('❌ Integration run on push: **failure**\n')).toBe(true)
    expect(out).toContain('No ref is pinned: this PR targets stage or main, so it ran against the :main images')
    expect(out).toContain('<summary>Failure output</summary>')
    expect(out).not.toContain('<!--')
  })
})
