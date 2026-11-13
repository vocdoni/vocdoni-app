import { execFileSync } from 'node:child_process'

// Short commit sha of the build, for the `build-commit` meta tag every page carries.
// COMMIT_SHA wins because the Docker build context has no .git; git is the fallback
// for local builds. Anything outside this charset could break out of the attribute.
const SAFE_SHA = /^[0-9a-zA-Z._-]+$/

const readGitShortSha = (): string =>
  execFileSync('git', ['rev-parse', '--short', 'HEAD'], { stdio: 'pipe' }).toString()

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
  if (sha && SAFE_SHA.test(sha)) return sha
  // The value itself is left out of the warning: it may be arbitrary text.
  if (sha) warn('The build commit has characters outside [0-9a-zA-Z._-]; the build-commit meta tag uses unknown.')
  return 'unknown'
}
