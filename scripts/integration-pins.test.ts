import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const scriptPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'integration-pins.sh')

function parse(input: string) {
  const res = spawnSync('bash', [scriptPath], { input, encoding: 'utf8' })
  return { status: res.status, stdout: res.stdout, stderr: res.stderr }
}

function expectOk(input: string, nodeRef: string, saasRef: string, sdkRef: string, sticky: boolean, reset = false) {
  const res = parse(input)
  expect(res.status).toBe(0)
  expect(res.stdout).toBe(
    `vocdoni_node_ref=${nodeRef}\nsaas_backend_ref=${saasRef}\nintegrator_sdk_ref=${sdkRef}\nsticky=${sticky}\nreset=${reset}\n`
  )
  expect(res.stderr).toBe('')
}

function expectError(input: string) {
  const res = parse(input)
  expect(res.status).toBe(1)
  expect(res.stdout).toBe('')
  expect(res.stderr).toMatch(/^ERROR: /)
}

describe('integration-pins.sh', () => {
  describe('accepted comments', () => {
    it('bare /integration pins nothing and is one-shot', () => {
      expectOk('/integration', '', '', '', false)
      expectOk('/integration\n', '', '', '', false)
    })

    it('SHA-only refs are one-shot', () => {
      expectOk('/integration vocdoni-node=1a2b3c4 saas-backend=abcdef0123', '1a2b3c4', 'abcdef0123', '', false)
      expectOk('/integration vocdoni-node=1a2b3c4', '1a2b3c4', '', '', false)
      expectOk('/integration integrator-sdk=1a2b3c4', '', '', '1a2b3c4', false)
      const sha = 'a'.repeat(40)
      expectOk(`/integration integrator-sdk=${sha}`, '', '', sha, false)
    })

    it('mixed SHA and branch is one-shot', () => {
      expectOk(
        '/integration vocdoni-node=1a2b3c4 saas-backend=main integrator-sdk=v1.2.0',
        '1a2b3c4',
        'main',
        'v1.2.0',
        false
      )
    })

    it('a branch ref is sticky', () => {
      expectOk('/integration saas-backend=feat/x.y', '', 'feat/x.y', '', true)
      expectOk('/integration vocdoni-node=abc', 'abc', '', '', true)
      expectOk('/integration integrator-sdk=release/1.0.0', '', '', 'release/1.0.0', true)
    })

    it('a #PR ref is accepted and sticky', () => {
      expectOk('/integration saas-backend=#760', '', '#760', '', true)
      expectOk('/integration vocdoni-node=#1 saas-backend=#999999999', '#1', '#999999999', '', true)
      expectOk('/integration integrator-sdk=#88', '', '', '#88', true)
    })

    it('a branch with a #PR is sticky', () => {
      expectOk('/integration vocdoni-node=main saas-backend=#760', 'main', '#760', '', true)
      expectOk('/integration vocdoni-node=1a2b3c4 integrator-sdk=#88', '1a2b3c4', '', '#88', false)
    })

    it('accepts all three keys', () => {
      expectOk(
        '/integration vocdoni-node=pull/123/head saas-backend=main integrator-sdk=v1.2.0',
        'pull/123/head',
        'main',
        'v1.2.0',
        true
      )
    })

    it('accepts refs with slashes and dots', () => {
      expectOk('/integration saas-backend=feat/x.y', '', 'feat/x.y', '', true)
      expectOk('/integration integrator-sdk=release/1.0.0', '', '', 'release/1.0.0', true)
    })

    it('accepts a ref of exactly 100 characters', () => {
      const ref = 'a'.repeat(100)
      expectOk(`/integration saas-backend=${ref}`, '', ref, '', true)
    })

    it('only reads the first line', () => {
      expectOk('/integration vocdoni-node=abc\nsaas-backend=ignored\n/integration bogus!', 'abc', '', '', true)
    })

    it('strips a CRLF line ending', () => {
      expectOk(
        '/integration vocdoni-node=1a2b3c4 saas-backend=1a2b3c5 integrator-sdk=1a2b3c6\r\nmore text\r\n',
        '1a2b3c4',
        '1a2b3c5',
        '1a2b3c6',
        false
      )
    })

    it('tolerates extra whitespace and tabs', () => {
      expectOk('/integration   vocdoni-node=1a2b3c4 \t integrator-sdk=1a2b3c5  ', '1a2b3c4', '', '1a2b3c5', false)
      expectOk('/integration\tvocdoni-node=1a2b3c4', '1a2b3c4', '', '', false)
    })

    it('reset clears the sticky state', () => {
      expectOk('/integration reset', '', '', '', false, true)
      expectOk('/integration reset\nmore text', '', '', '', false, true)
    })
  })

  describe('rejected comments', () => {
    it('rejects anything that is not the /integration command', () => {
      expectError('/integrationx vocdoni-node=abc')
      expectError('hello')
      expectError('')
    })

    it('rejects an unknown key', () => {
      expectError('/integration vocdoni=abc')
      expectError('/integration integrator=abc')
    })

    it('rejects a token without =', () => {
      expectError('/integration vocdoni-node')
      expectError('/integration integrator-sdk')
    })

    it('rejects a key given twice', () => {
      expectError('/integration vocdoni-node=a vocdoni-node=b')
      expectError('/integration saas-backend=a saas-backend=a')
      expectError('/integration integrator-sdk=main integrator-sdk=main')
    })

    it('rejects an empty ref', () => {
      expectError('/integration vocdoni-node=')
      expectError('/integration integrator-sdk=')
    })

    it('rejects a ref containing ..', () => {
      expectError('/integration vocdoni-node=a..b')
      expectError('/integration integrator-sdk=v1..v2')
    })

    it('rejects a ref starting with -', () => {
      expectError('/integration vocdoni-node=-rf')
      expectError('/integration integrator-sdk=--upload-pack=x')
    })

    it('rejects a ref longer than 100 characters', () => {
      expectError(`/integration saas-backend=${'a'.repeat(101)}`)
    })

    it('rejects an uppercase key', () => {
      expectError('/integration Vocdoni-Node=abc')
    })

    it('rejects an = inside a ref', () => {
      expectError('/integration vocdoni-node=a=b')
    })

    it('rejects shell metacharacters', () => {
      expectError('/integration vocdoni-node=a;b')
      expectError('/integration integrator-sdk=$(id)')
    })

    it('rejects malformed #PR refs', () => {
      expectError('/integration vocdoni-node=#')
      expectError('/integration integrator-sdk=#abc')
      expectError('/integration vocdoni-node=#1/2')
      expectError('/integration vocdoni-node=#1234567890')
    })

    it('rejects reset with any other token', () => {
      expectError('/integration reset vocdoni-node=abc')
      expectError('/integration reset reset')
      expectError('/integration reset foo')
    })
  })
})
