import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { addOverrides } from './integration-use-sdk.mjs'

const scriptPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'integration-use-sdk.mjs')

const workspace = [
  '# Security floors for transitive dependencies.',
  'overrides:',
  '  # viem pins ws exact.',
  "  'ws@^8': ^8.21.0",
  '  axios: ^1.18.0',
  '',
  'packages:',
  "  - 'apps/*'",
  '',
].join('\n')

describe('addOverrides', () => {
  it('inserts entries right after the overrides line and keeps existing entries and comments', () => {
    const out = addOverrides(workspace, [{ name: '@vocdoni/api-client', spec: 'file:/tmp/a.tgz' }])
    expect(out).toBe(
      [
        '# Security floors for transitive dependencies.',
        'overrides:',
        "  '@vocdoni/api-client': 'file:/tmp/a.tgz'",
        '  # viem pins ws exact.',
        "  'ws@^8': ^8.21.0",
        '  axios: ^1.18.0',
        '',
        'packages:',
        "  - 'apps/*'",
        '',
      ].join('\n')
    )
  })

  it('keeps the order of several entries', () => {
    const out = addOverrides(workspace, [
      { name: '@vocdoni/api-client', spec: 'file:/tmp/a.tgz' },
      { name: '@vocdoni/react-providers', spec: 'file:/tmp/b.tgz' },
    ])
    const lines = out.split('\n')
    expect(lines.slice(2, 4)).toEqual([
      "  '@vocdoni/api-client': 'file:/tmp/a.tgz'",
      "  '@vocdoni/react-providers': 'file:/tmp/b.tgz'",
    ])
  })

  it('quotes a single quote inside a value by doubling it', () => {
    const out = addOverrides('overrides:\n', [{ name: "o'brien", spec: "file:/tmp/it's.tgz" }])
    expect(out).toBe("overrides:\n  'o''brien': 'file:/tmp/it''s.tgz'\n")
  })

  it('creates the overrides block at the end when there is none', () => {
    const out = addOverrides('packages:\n  - apps/*\n', [{ name: '@vocdoni/sdk', spec: 'file:/tmp/s.tgz' }])
    expect(out).toBe("packages:\n  - apps/*\noverrides:\n  '@vocdoni/sdk': 'file:/tmp/s.tgz'\n")
  })

  it('adds a missing final newline before appending a new block', () => {
    const out = addOverrides('packages:\n  - apps/*', [{ name: '@vocdoni/sdk', spec: 'file:/tmp/s.tgz' }])
    expect(out).toBe("packages:\n  - apps/*\noverrides:\n  '@vocdoni/sdk': 'file:/tmp/s.tgz'\n")
  })

  it('replaces an existing override for the same name', () => {
    const out = addOverrides(workspace, [{ name: 'axios', spec: 'file:/tmp/a.tgz' }])
    expect(out).toBe(
      [
        '# Security floors for transitive dependencies.',
        'overrides:',
        "  'axios': 'file:/tmp/a.tgz'",
        '  # viem pins ws exact.',
        "  'ws@^8': ^8.21.0",
        '',
        'packages:',
        "  - 'apps/*'",
        '',
      ].join('\n')
    )
  })

  it('replaces an existing override that has a version selector', () => {
    const out = addOverrides(workspace, [{ name: 'ws', spec: 'file:/tmp/a.tgz' }])
    expect(out).toContain("  'ws': 'file:/tmp/a.tgz'\n")
    expect(out).not.toContain("'ws@^8'")
  })

  it('replaces an existing override that is a scoped package with a version selector', () => {
    const scoped = "overrides:\n  '@vocdoni/sdk@^2': ^2.0.0\n  axios: ^1.18.0\n"
    const out = addOverrides(scoped, [{ name: '@vocdoni/sdk', spec: 'file:/tmp/s.tgz' }])
    expect(out).toBe("overrides:\n  '@vocdoni/sdk': 'file:/tmp/s.tgz'\n  axios: ^1.18.0\n")
  })

  it('does not treat a longer package name as a duplicate', () => {
    const out = addOverrides(workspace, [{ name: 'axios-retry', spec: 'file:/tmp/a.tgz' }])
    expect(out).toContain("  'axios-retry': 'file:/tmp/a.tgz'")
  })

  it('rejects two tarballs for the same package', () => {
    expect(() =>
      addOverrides(workspace, [
        { name: '@vocdoni/sdk', spec: 'file:/tmp/a.tgz' },
        { name: '@vocdoni/sdk', spec: 'file:/tmp/b.tgz' },
      ])
    ).toThrow(/more than one tarball for @vocdoni\/sdk/)
  })

  it('refuses an overrides line it cannot extend safely', () => {
    expect(() => addOverrides('overrides: {}\n', [{ name: 'a', spec: 'file:/tmp/a.tgz' }])).toThrow(/unsupported/)
  })
})

describe('integration-use-sdk.mjs CLI', () => {
  let tmp: string

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'use-sdk-'))
  })

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it('overrides each packed package in the workspace file', () => {
    // A minimal npm-style tarball: package/package.json inside a .tgz.
    const stage = path.join(tmp, 'stage', 'package')
    fs.mkdirSync(stage, { recursive: true })
    fs.writeFileSync(
      path.join(stage, 'package.json'),
      JSON.stringify({ name: '@vocdoni/api-client', version: '1.0.0' })
    )
    const tarDir = path.join(tmp, 'tarballs')
    fs.mkdirSync(tarDir)
    const tar = spawnSync('tar', [
      '-czf',
      path.join(tarDir, 'vocdoni-api-client-1.0.0.tgz'),
      '-C',
      path.join(tmp, 'stage'),
      'package',
    ])
    expect(tar.status).toBe(0)

    const yamlPath = path.join(tmp, 'pnpm-workspace.yaml')
    fs.writeFileSync(yamlPath, workspace)

    const res = spawnSync('node', [scriptPath, tarDir], {
      encoding: 'utf8',
      env: { ...process.env, INTEGRATION_WORKSPACE_YAML: yamlPath },
    })
    expect(res.status).toBe(0)
    expect(res.stderr).toContain('overridden: @vocdoni/api-client')

    const expectedSpec = `file:${path.join(tarDir, 'vocdoni-api-client-1.0.0.tgz')}`
    expect(fs.readFileSync(yamlPath, 'utf8')).toContain(`  '@vocdoni/api-client': '${expectedSpec}'\n`)
  })

  it('replaces an override that the package already has', () => {
    const stage = path.join(tmp, 'stage', 'package')
    fs.mkdirSync(stage, { recursive: true })
    fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify({ name: 'axios' }))
    const tarDir = path.join(tmp, 'tarballs')
    fs.mkdirSync(tarDir)
    spawnSync('tar', ['-czf', path.join(tarDir, 'axios-1.0.0.tgz'), '-C', path.join(tmp, 'stage'), 'package'])

    const yamlPath = path.join(tmp, 'pnpm-workspace.yaml')
    fs.writeFileSync(yamlPath, workspace)

    const res = spawnSync('node', [scriptPath, tarDir], {
      encoding: 'utf8',
      env: { ...process.env, INTEGRATION_WORKSPACE_YAML: yamlPath },
    })
    expect(res.status).toBe(0)
    expect(res.stderr).toContain('overridden: axios')
    const yaml = fs.readFileSync(yamlPath, 'utf8')
    expect(yaml).toContain(`  'axios': 'file:${path.join(tarDir, 'axios-1.0.0.tgz')}'\n`)
    expect(yaml).not.toContain('axios: ^1.18.0')
  })

  it('fails without touching the workspace file when two tarballs share a package name', () => {
    const stage = path.join(tmp, 'stage', 'package')
    fs.mkdirSync(stage, { recursive: true })
    fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify({ name: '@vocdoni/sdk' }))
    const tarDir = path.join(tmp, 'tarballs')
    fs.mkdirSync(tarDir)
    spawnSync('tar', ['-czf', path.join(tarDir, 'a.tgz'), '-C', path.join(tmp, 'stage'), 'package'])
    spawnSync('tar', ['-czf', path.join(tarDir, 'b.tgz'), '-C', path.join(tmp, 'stage'), 'package'])

    const yamlPath = path.join(tmp, 'pnpm-workspace.yaml')
    fs.writeFileSync(yamlPath, workspace)

    const res = spawnSync('node', [scriptPath, tarDir], {
      encoding: 'utf8',
      env: { ...process.env, INTEGRATION_WORKSPACE_YAML: yamlPath },
    })
    expect(res.status).toBe(1)
    expect(res.stderr).toMatch(/^ERROR: more than one tarball for @vocdoni\/sdk/)
    expect(fs.readFileSync(yamlPath, 'utf8')).toBe(workspace)
  })
})
