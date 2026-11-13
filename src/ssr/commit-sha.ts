import { execFileSync } from 'node:child_process'

// Short sha for the `build-commit` meta tag, read at runtime since DO App Platform only exposes the commit to the
// running container. COMMIT_SHA wins, git is the local-dev fallback; the charset keeps it inside the attribute.
const SAFE_SHA = /^[0-9a-zA-Z._-]+$/
const FULL_HEX_SHA = /^[0-9a-f]{40}([0-9a-f]{24})?$/i

const readGitShortSha = (): string =>
  execFileSync('git', ['rev-parse', '--short', 'HEAD'], { stdio: 'pipe' }).toString()

// COMMIT_SHA carries the full hash (sha1 or sha256); git's own short output is kept as is, since it may be longer.
const shortenSha = (sha: string): string => (FULL_HEX_SHA.test(sha) ? sha.slice(0, 7) : sha)

export const resolveCommitSha = ({
  env = process.env,
  gitShortSha = readGitShortSha,
  warn = console.warn,
}: {
  env?: NodeJS.ProcessEnv
  gitShortSha?: () => string
  warn?: (message: string) => void
} = {}): string => {
  let sha = env.COMMIT_SHA?.trim()
  if (!sha) {
    try {
      sha = gitShortSha().trim()
    } catch {
      warn('Unable to resolve the git commit hash for the build-commit meta tag.')
    }
  }
  if (sha && SAFE_SHA.test(sha)) return shortenSha(sha)
  // The value itself is left out of the warning: it may be arbitrary text.
  if (sha) warn('The build commit has characters outside [0-9a-zA-Z._-]; the build-commit meta tag uses unknown.')
  return 'unknown'
}

// Env and git do not change while the process runs, so the sha is resolved once, on the first render.
let commitSha: string | undefined

export const getCommitSha = (): string => (commitSha ??= resolveCommitSha())
