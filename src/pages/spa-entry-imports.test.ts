import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

// Every SPA page, sign-in included, preloads the chunk built from this page's static imports.
// Libraries only some screens use must be reached through lazy() or import() instead.
const ROOT = path.resolve(__dirname, '../..')
const SPA_ENTRY = path.join(ROOT, 'src/pages/@lang/@catchAll/+Page.tsx')
const LAZY_ONLY = [
  /^lexical$/,
  /^@lexical\//,
  /^prismjs/,
  /^react-player/,
  /^@calcom\//,
  /^@stripe\//,
  /^gsap/,
  /^wagmi/,
  /^@wagmi\//,
  /^viem/,
  /^@vocdoni\/rainbowkit-wallets/,
]

// The app's tsconfig, so the `~` path aliases resolve as they do in the build.
const host = { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} }
const compilerOptions = ts.getParsedCommandLineOfConfigFile(path.join(ROOT, 'tsconfig.json'), {}, host)!.options

const isTypeOnly = (node: ts.ImportDeclaration) => {
  const clause = node.importClause
  if (!clause) return false
  if (clause.isTypeOnly) return true
  if (clause.name) return false
  const bindings = clause.namedBindings
  return !!bindings && ts.isNamedImports(bindings) && bindings.elements.every((element) => element.isTypeOnly)
}

// Module specifiers a file loads eagerly: import/export ... from, minus type-only ones and import().
const staticImports = (file: string) => {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest)
  return source.statements.flatMap((node) => {
    if (ts.isImportDeclaration(node) && !isTypeOnly(node)) return [(node.moduleSpecifier as ts.StringLiteral).text]
    if (ts.isExportDeclaration(node) && node.moduleSpecifier && !node.isTypeOnly)
      return [(node.moduleSpecifier as ts.StringLiteral).text]
    return []
  })
}

const findLazyOnlyImports = (entry: string) => {
  const parent = new Map<string, string | null>([[entry, null]])
  const queue = [entry]
  const offenders: string[] = []
  const chain = (file: string | null): string[] =>
    file ? [...chain(parent.get(file) ?? null), path.relative(ROOT, file)] : []

  while (queue.length) {
    const file = queue.shift()!
    for (const specifier of staticImports(file)) {
      const isPackage = !specifier.startsWith('.') && !specifier.startsWith('~')
      if (isPackage) {
        if (LAZY_ONLY.some((pattern) => pattern.test(specifier)))
          offenders.push(`${specifier} via ${chain(file).join(' -> ')}`)
        continue
      }
      const resolved = ts.resolveModuleName(specifier, file, compilerOptions, ts.sys).resolvedModule?.resolvedFileName
      if (!resolved || !/\.(tsx?|jsx?)$/.test(resolved) || parent.has(resolved)) continue
      parent.set(resolved, file)
      queue.push(resolved)
    }
  }
  return { offenders, visited: [...parent.keys()].map((file) => path.relative(ROOT, file)) }
}

describe('SPA entry static imports', () => {
  it('reaches no library that only some screens use', () => {
    const { offenders, visited } = findLazyOnlyImports(SPA_ENTRY)

    // The walk must really follow the `~` aliases, or an empty list proves nothing.
    expect(visited).toEqual(
      expect.arrayContaining([
        'src/Providers.tsx',
        'src/router/Router.tsx',
        'src/router/routes/dashboard.tsx',
        'src/elements/DashboardShell.tsx',
      ])
    )
    expect(visited.length).toBeGreaterThan(100)
    expect(offenders).toEqual([])
  })
})
