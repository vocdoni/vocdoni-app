import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const agentsSkillsDir = path.join(root, '.agents', 'skills')
const claudeSkillsDir = path.join(root, '.claude', 'skills')

// Installed by `skills add`, git-ignored on purpose: never a project skill.
const installedSkills = ['vocdoni-integrator-sdk']

const gitignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8')
const agentsExceptions = [...gitignore.matchAll(/^!\/\.agents\/skills\/([^/\s]+)\/$/gm)].map((match) => match[1])
const claudeExceptions = [...gitignore.matchAll(/^!\/\.claude\/skills\/([^/\s]+)$/gm)].map((match) => match[1])

const skillNames = [...new Set(agentsExceptions)].sort()

// `.agents/skills` may be missing entirely in a fresh clone.
const localSkillDirs = fs.existsSync(agentsSkillsDir)
  ? fs
      .readdirSync(agentsSkillsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(agentsSkillsDir, entry.name, 'SKILL.md')))
      .map((entry) => entry.name)
      .filter((name) => !installedSkills.includes(name))
  : []

function frontmatter(file: string): Record<string, string> {
  const match = /^---\n([\s\S]*?)\n---/.exec(fs.readFileSync(file, 'utf8'))
  const fields: Record<string, string> = {}
  for (const line of match?.[1].split('\n') ?? []) {
    const field = /^([a-z-]+):\s*(.*)$/.exec(line)
    if (field) fields[field[1]] = field[2].trim().replace(/^"(.*)"$/, '$1')
  }
  return fields
}

describe('project agent skills', () => {
  it('lists the same skills in the .agents and .claude gitignore exceptions', () => {
    expect(agentsExceptions.length, 'no `!/.agents/skills/<name>/` lines found in .gitignore').toBeGreaterThan(0)
    expect(claudeExceptions.length, 'no `!/.claude/skills/<name>` lines found in .gitignore').toBeGreaterThan(0)
    expect([...agentsExceptions].sort()).toEqual([...claudeExceptions].sort())
  })

  it.each(skillNames)('%s is committed with a valid SKILL.md and .claude symlink', (name) => {
    const skillFile = path.join(agentsSkillsDir, name, 'SKILL.md')
    const relSkillFile = path.relative(root, skillFile)
    expect(
      fs.existsSync(skillFile),
      `${relSkillFile} is missing: add the skill or drop its .gitignore exceptions`
    ).toBe(true)

    const fields = frontmatter(skillFile)
    expect(fields.name, `${relSkillFile} frontmatter \`name\` must be "${name}" (the folder name)`).toBe(name)
    expect(fields.description, `${relSkillFile} frontmatter \`description\` must not be empty`).toBeTruthy()

    const link = path.join(claudeSkillsDir, name)
    const relLink = path.relative(root, link)
    const stat = fs.lstatSync(link, { throwIfNoEntry: false })
    expect(
      stat?.isSymbolicLink(),
      `${relLink} must be a symlink: run \`ln -s ../../.agents/skills/${name} ${relLink}\``
    ).toBe(true)
    expect(fs.readlinkSync(link), `${relLink} must point at ../../.agents/skills/${name} (relative)`).toBe(
      `../../.agents/skills/${name}`
    )
  })

  it.each(localSkillDirs)('%s is listed in .gitignore so it ships', (name) => {
    expect(
      agentsExceptions,
      `add \`!/.agents/skills/${name}/\` and \`!/.claude/skills/${name}\` to .gitignore, or git will silently ignore the skill`
    ).toContain(name)
    expect(
      claudeExceptions,
      `add \`!/.claude/skills/${name}\` to .gitignore, or git will silently ignore the symlink`
    ).toContain(name)
  })
})
