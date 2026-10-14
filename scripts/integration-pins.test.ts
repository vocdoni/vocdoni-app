import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const scriptPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'integration-pins.sh')

function parse(input: string) {
  const res = spawnSync('bash', [scriptPath], { input, encoding: 'utf8' })
  return { status: res.status, stdout: res.stdout, stderr: res.stderr }
}

function expectOk(input: string, nodeRef: string, saasRef: string, sdkRef: string) {
  const res = parse(input)
  expect(res.status).toBe(0)
  expect(res.stdout).toBe(`vocdoni_node_ref=${nodeRef}\nsaas_backend_ref=${saasRef}\nintegrator_sdk_ref=${sdkRef}\n`)
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
    it('bare /integration pins nothing', () => {
      expectOk('/integration', '', '', '')
      expectOk('/integration\n', '', '', '')
    })

    it('accepts all three keys', () => {
      expectOk('/integration vocdoni-node=1a2b3c4 saas-backend=main integrator-sdk=v1.2.0', '1a2b3c4', 'main', 'v1.2.0')
    })

    it('accepts the two upstream keys without the SDK', () => {
      expectOk('/integration vocdoni-node=1a2b3c4 saas-backend=main', '1a2b3c4', 'main', '')
    })

    it('accepts each key alone', () => {
      expectOk('/integration vocdoni-node=abc', 'abc', '', '')
      expectOk('/integration saas-backend=abc', '', 'abc', '')
      expectOk('/integration integrator-sdk=abc', '', '', 'abc')
    })

    it('accepts refs with slashes and dots', () => {
      expectOk('/integration saas-backend=feat/x.y', '', 'feat/x.y', '')
      expectOk('/integration integrator-sdk=release/1.0.0', '', '', 'release/1.0.0')
    })

    it('accepts a PR head ref and a full SHA', () => {
      expectOk('/integration vocdoni-node=pull/123/head', 'pull/123/head', '', '')
      const sha = 'a'.repeat(40)
      expectOk(`/integration integrator-sdk=${sha}`, '', '', sha)
    })

    it('accepts a ref of exactly 100 characters', () => {
      const ref = 'a'.repeat(100)
      expectOk(`/integration saas-backend=${ref}`, '', ref, '')
    })

    it('only reads the first line', () => {
      expectOk('/integration vocdoni-node=abc\nsaas-backend=ignored\n/integration bogus!', 'abc', '', '')
    })

    it('strips a CRLF line ending', () => {
      expectOk(
        '/integration vocdoni-node=abc saas-backend=def integrator-sdk=ghi\r\nmore text\r\n',
        'abc',
        'def',
        'ghi'
      )
    })

    it('tolerates extra whitespace and tabs', () => {
      expectOk('/integration   vocdoni-node=abc \t integrator-sdk=def  ', 'abc', '', 'def')
      expectOk('/integration\tvocdoni-node=abc', 'abc', '', '')
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

    it('rejects a ref ending in a slash', () => {
      expectError('/integration vocdoni-node=feat/')
    })

    it('rejects shell metacharacters', () => {
      expectError('/integration vocdoni-node=a;b')
      expectError('/integration integrator-sdk=$(id)')
    })
  })
})
