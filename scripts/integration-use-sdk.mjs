#!/usr/bin/env node
// Points every @vocdoni/* package the repo resolves at the tarballs in a
// directory (built by scripts/integration-build-sdk.sh), by adding one pnpm
// override per tarball to pnpm-workspace.yaml. Overrides apply to transitive
// copies too, so e.g. react-components picks up the built react-providers.
//
// Usage:
//   node scripts/integration-use-sdk.mjs <tarball-dir>
//
// Then run `pnpm install --no-frozen-lockfile`. Locally this rewrites
// pnpm-workspace.yaml and pnpm-lock.yaml: restore them with
// `git checkout pnpm-workspace.yaml pnpm-lock.yaml` when you are done.
//
// Env:
//   INTEGRATION_WORKSPACE_YAML  workspace file to edit (default: the repo's pnpm-workspace.yaml)
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// YAML single-quoted scalar: the only escape is a doubled quote.
const quote = (value) => `'${value.replace(/'/g, "''")}'`

// Keys of the `overrides:` block, read from its indented lines only.
function existingOverrideKeys(lines, headerIndex) {
  const keys = []
  for (const line of lines.slice(headerIndex + 1)) {
    if (line.trim() !== '' && !/^\s/.test(line)) break
    const match = /^ +['"]?([^'":]+)['"]?\s*:/.exec(line)
    if (match) keys.push(match[1])
  }
  return keys
}

// Pure text transform: returns pnpm-workspace.yaml text with one `name: spec`
// override per entry. Entries go right after the `overrides:` line, or into a
// new block at the end of the file when there is none. Throws instead of
// duplicating an override for a name that already has one.
export function addOverrides(yamlText, entries) {
  const lines = yamlText.split('\n')
  const headerIndex = lines.findIndex((line) => line.startsWith('overrides:'))
  if (headerIndex !== -1 && !/^overrides:\s*$/.test(lines[headerIndex])) {
    throw new Error(`unsupported overrides line "${lines[headerIndex]}", expected a bare "overrides:" block`)
  }

  const existing = headerIndex === -1 ? [] : existingOverrideKeys(lines, headerIndex)
  const seen = new Set()
  for (const { name } of entries) {
    if (seen.has(name)) {
      throw new Error(`more than one tarball for ${name}`)
    }
    seen.add(name)
    if (existing.some((key) => key === name || key.startsWith(`${name}@`))) {
      throw new Error(`pnpm-workspace.yaml already overrides ${name}`)
    }
  }

  const added = entries.map(({ name, spec }) => `  ${quote(name)}: ${quote(spec)}`)
  if (headerIndex !== -1) {
    lines.splice(headerIndex + 1, 0, ...added)
    return lines.join('\n')
  }
  const base = yamlText === '' || yamlText.endsWith('\n') ? yamlText : `${yamlText}\n`
  return `${base}overrides:\n${added.map((line) => `${line}\n`).join('')}`
}

// Package name from a packed tarball: npm tarballs keep everything under package/.
export function readTarballName(tgzPath) {
  const json = execFileSync('tar', ['-xOzf', tgzPath, 'package/package.json'], { encoding: 'utf8' })
  const name = JSON.parse(json).name
  if (typeof name !== 'string' || name === '') {
    throw new Error(`no package name in ${tgzPath}`)
  }
  return name
}

function main(argv) {
  const [tarballDir] = argv
  if (!tarballDir) {
    throw new Error('usage: node scripts/integration-use-sdk.mjs <tarball-dir>')
  }
  const absDir = path.resolve(tarballDir)
  const tarballs = fs
    .readdirSync(absDir)
    .filter((file) => file.endsWith('.tgz'))
    .sort()
  if (tarballs.length === 0) {
    throw new Error(`no .tgz files in ${absDir}`)
  }

  const entries = tarballs.map((file) => {
    const abs = path.join(absDir, file)
    return { name: readTarballName(abs), spec: `file:${abs}` }
  })

  const yamlPath = process.env.INTEGRATION_WORKSPACE_YAML || path.join(repoRoot, 'pnpm-workspace.yaml')
  const next = addOverrides(fs.readFileSync(yamlPath, 'utf8'), entries)
  fs.writeFileSync(yamlPath, next)

  for (const { name, spec } of entries) {
    process.stderr.write(`overridden: ${name} -> ${spec}\n`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main(process.argv.slice(2))
  } catch (err) {
    console.error(`ERROR: ${err.message}`)
    process.exit(1)
  }
}
