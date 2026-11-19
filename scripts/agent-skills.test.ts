import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const agentsSkillsDir = path.join(root, '.agents', 'skills')
// Installed by `npx skills add`: git-ignored on purpose, never a project skill.
const installedSkill = 'vocdoni-integrator-sdk'

// Hooks (pre-push runs the tests) export GIT_DIR and friends, which would override the repos chosen below.
const gitEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')))

// Git decides what is ignored, so the rules are never re-implemented here.
function git(...args: string[]): string[] {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', env: gitEnv }).split('\n').filter(Boolean)
}

// An empty repository made without a template has no info/exclude and, with core.excludesFile disabled, no global
// excludes: only the repo's .gitignore files apply. `--no-index` checks tracked files too.
// Created in beforeAll, so a module-scope failure below leaves no temp directory behind.
let emptyRepo: string
beforeAll(() => {
  emptyRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-skills-'))
  execFileSync('git', ['init', '-q', '--template=', emptyRepo], { env: gitEnv })
})
afterAll(() => {
  if (emptyRepo) fs.rmSync(emptyRepo, { recursive: true, force: true })
})

// check-ignore exits 1 when nothing matches. With -v a `!` pattern is a negated match, printed with exit 0.
function isIgnored(file: string): boolean {
  let output: string
  try {
    output = execFileSync(
      'git',
      [
        `--git-dir=${emptyRepo}/.git`,
        `--work-tree=${root}`,
        '-c',
        'core.excludesFile=/dev/null',
        'check-ignore',
        '-v',
        '--no-index',
        '--',
        file,
      ],
      { cwd: root, encoding: 'utf8', env: gitEnv }
    )
  } catch (error) {
    if ((error as { status?: number }).status === 1) return false
    throw error
  }
  // Each line is `<source>:<linenum>:<pattern>\t<path>`.
  const match = /:\d+:(.*)\t/.exec(output)
  return match !== null && !match[1].startsWith('!')
}

// The skill name: third path segment of `.agents/skills/<name>/...` or `.claude/skills/<name>`.
const skillNameOf = (file: string) => file.split('/')[2]

const lockFile = path.join(root, 'skills-lock.json')
const lockedSkills = fs.existsSync(lockFile) ? Object.keys(parseLockFile(lockFile).skills ?? {}) : []

function parseLockFile(file: string): { skills?: Record<string, unknown> } {
  let lock: unknown
  try {
    lock = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    throw new Error(`skills-lock.json could not be read or parsed: ${(error as Error).message}`)
  }
  if (typeof lock !== 'object' || lock === null) throw new Error('skills-lock.json must hold a JSON object')
  return lock
}

const projectSkills = [...new Set(git('ls-files', '--', '.agents/skills').map(skillNameOf))].sort()

function frontmatter(file: string): Record<string, string> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(fs.readFileSync(file, 'utf8'))
  const fields: Record<string, string> = {}
  for (const line of match?.[1].split(/\r?\n/) ?? []) {
    const field = /^([\w-]+):\s*(.*?)\s*$/.exec(line)
    if (field) fields[field[1]] = field[2].replace(/^(["'])(.*)\1$/, '$2')
  }
  return fields
}

describe('project agent skills', () => {
  it('has committed project skills under .agents/skills', () => {
    expect(projectSkills, 'no tracked files under .agents/skills').not.toHaveLength(0)
  })

  it('has a tracked .claude/skills symlink for every project skill and no orphan', () => {
    const links = [...new Set(git('ls-files', '--', '.claude/skills').map(skillNameOf))].sort()
    expect(
      links,
      'tracked .claude/skills entries must match .agents/skills: add the missing symlink or remove the orphan'
    ).toEqual(projectSkills)
  })

  it.each(projectSkills)('%s has a committed SKILL.md with a matching name and a description', (name) => {
    const skillFile = `.agents/skills/${name}/SKILL.md`
    expect(git('ls-files', '--', skillFile), `${skillFile} must be committed: git add it`).toEqual([skillFile])

    const fields = frontmatter(path.join(root, skillFile))
    expect(fields.name, `${skillFile} frontmatter \`name\` must be "${name}" (the folder name)`).toBe(name)
    expect(fields.description, `${skillFile} frontmatter \`description\` must not be empty`).toBeTruthy()
  })

  it.each(projectSkills)('%s has a committed relative .claude/skills symlink', (name) => {
    const link = `.claude/skills/${name}`
    const [entry] = git('ls-files', '-s', '--', link)
    expect(
      entry?.startsWith('120000 '),
      `${link} must be a committed symlink: run \`ln -s ../../.agents/skills/${name} ${link}\``
    ).toBe(true)

    const target = fs.lstatSync(path.join(root, link), { throwIfNoEntry: false })?.isSymbolicLink()
      ? fs.readlinkSync(path.join(root, link)).replaceAll('\\', '/') // Git for Windows writes backslash targets
      : undefined
    expect(target, `${link} must point at ../../.agents/skills/${name} (relative)`).toBe(`../../.agents/skills/${name}`)
  })

  it.each(projectSkills)('%s is not git-ignored, so its files ship', (name) => {
    const files = [`.agents/skills/${name}/SKILL.md`, `.claude/skills/${name}`]
    for (const file of files) {
      expect(
        isIgnored(file),
        `${file} is git-ignored: add the \`!/.agents/skills/${name}/\` and \`!/.claude/skills/${name}\` exceptions to the AI block in .gitignore`
      ).toBe(false)
    }
  })

  it('keeps the locally installed SDK skill, its symlink and skills-lock.json git-ignored', () => {
    for (const file of [
      `.agents/skills/${installedSkill}/SKILL.md`,
      `.claude/skills/${installedSkill}`,
      'skills-lock.json',
    ]) {
      expect(isIgnored(file), `${file} must stay git-ignored: it is installed locally, never commit it`).toBe(true)
    }
  })

  it('has no untracked skill on disk that is missing from skills-lock.json', () => {
    const problems = fs.existsSync(agentsSkillsDir)
      ? fs
          .readdirSync(agentsSkillsDir, { withFileTypes: true })
          .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(agentsSkillsDir, entry.name, 'SKILL.md')))
          .map((entry) => entry.name)
          .filter(
            (name) => !lockedSkills.includes(name) && git('ls-files', '--', `.agents/skills/${name}`).length === 0
          )
          .map(
            (name) =>
              `.agents/skills/${name}/SKILL.md is untracked and not in skills-lock.json. If it is a project skill, add its ` +
              `.gitignore exceptions and the .claude/skills/${name} symlink, then commit them. If it is a locally installed ` +
              `skill, install it with \`npx skills add\` so skills-lock.json records it. A personal skill belongs in your ` +
              `user-level skills folder, not here.`
          )
      : []
    expect(problems).toEqual([])
  })
})
