import { describe, expect, it, vi } from 'vitest'
import { resolveCommitSha } from './commit-sha'

describe('resolveCommitSha', () => {
  it('prefers COMMIT_SHA over git, so a container without git still gets the sha', () => {
    const gitShortSha = vi.fn(() => 'fromgit\n')

    expect(resolveCommitSha({ env: { COMMIT_SHA: ' deadbee\n' }, gitShortSha })).toBe('deadbee')
    expect(gitShortSha).not.toHaveBeenCalled()
  })

  it('falls back to git when COMMIT_SHA is unset or blank', () => {
    expect(resolveCommitSha({ env: {}, gitShortSha: () => 'abc1234\n' })).toBe('abc1234')
    expect(resolveCommitSha({ env: { COMMIT_SHA: '   ' }, gitShortSha: () => 'abc1234\n' })).toBe('abc1234')
  })

  it('returns unknown and warns when neither COMMIT_SHA nor git is available', () => {
    const warn = vi.fn()
    const gitShortSha = () => {
      throw new Error('not a git repository')
    }

    expect(resolveCommitSha({ env: {}, gitShortSha, warn })).toBe('unknown')
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('shortens the full 40-char hash DigitalOcean passes to the short form git prints', () => {
    expect(
      resolveCommitSha({ env: { COMMIT_SHA: '0123456789abcdef0123456789abcdef01234567' }, gitShortSha: () => 'x' })
    ).toBe('0123456')
  })

  it("keeps git's short sha as is, even when git lengthens it to stay unique", () => {
    expect(resolveCommitSha({ env: {}, gitShortSha: () => '71f133db\n' })).toBe('71f133db')
  })

  it('does not warn when COMMIT_SHA is set', () => {
    const warn = vi.fn()

    resolveCommitSha({ env: { COMMIT_SHA: 'deadbee' }, warn })
    expect(warn).not.toHaveBeenCalled()
  })

  it('rejects COMMIT_SHA values that could break out of the content attribute, and warns', () => {
    const warn = vi.fn()

    expect(resolveCommitSha({ env: { COMMIT_SHA: 'abc --><script>' }, gitShortSha: () => 'abc1234', warn })).toBe(
      'unknown'
    )
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).not.toContain('script')
  })

  it('rejects git output outside the charset, and warns', () => {
    const warn = vi.fn()

    expect(resolveCommitSha({ env: {}, gitShortSha: () => 'abc"1234\n', warn })).toBe('unknown')
    expect(warn).toHaveBeenCalledTimes(1)
  })
})
