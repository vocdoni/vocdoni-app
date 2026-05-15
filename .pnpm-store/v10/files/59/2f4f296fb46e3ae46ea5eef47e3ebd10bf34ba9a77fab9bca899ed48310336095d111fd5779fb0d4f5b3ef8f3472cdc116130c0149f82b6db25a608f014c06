import { join } from 'path'
import { stop, lookItUp, lookItUpSync } from '../src'
import { CWD, PKG_PATH, BAR_PATH, containsSync, contains } from './utils'

const containPkgJson = async (dir: string): Promise<string | null> =>
  await contains('package.json', dir)

const containPkgJsonSync = (dir: string): string | null => containsSync('package.json', dir)

describe('lookItUp', () => {
  it('should return package.json path', async () => {
    const result = await lookItUp('package.json', BAR_PATH)
    expect(result).toBe(PKG_PATH)
  })

  it('should return CWD if matcher function is provided', async () => {
    const result = await lookItUp(dir => containPkgJsonSync(dir), BAR_PATH)
    expect(result).toBe(CWD)
  })

  it('should return CWD if async matcher function is provided', async () => {
    const result = await lookItUp(async dir => await containPkgJson(dir), BAR_PATH)
    expect(result).toBe(CWD)
  })

  it('should return null if no file is found', async () => {
    const result = await lookItUp('no_such_file')
    expect(result).toBe(null)
  })

  it('should stop in advance if stop is returned from matcher function', async () => {
    const result = await lookItUp(dir => (dir === CWD ? stop : containPkgJsonSync(dir)), BAR_PATH)
    expect(result).toBe(null)
  })

  it('should return null if dir is provided', async () => {
    const result = await lookItUp(dir => containPkgJsonSync(dir), join(CWD, '..'))
    expect(result).toBe(null)
  })
})

describe('lookItUpSync', () => {
  it('should return package.json path', () => {
    const result = lookItUpSync('package.json', BAR_PATH)
    expect(result).toBe(PKG_PATH)
  })

  it('should return CWD if matcher function is provided', () => {
    const result = lookItUpSync(dir => containPkgJsonSync(dir), BAR_PATH)
    expect(result).toBe(CWD)
  })

  it('should return null if no file is found', () => {
    const result = lookItUpSync('no_such_file')
    expect(result).toBe(null)
  })

  it('should stop in advance if stop is returned from matcher function', () => {
    const result = lookItUpSync(dir => (dir === CWD ? stop : containPkgJsonSync(dir)), BAR_PATH)
    expect(result).toBe(null)
  })

  it('should return null if dir is provided', () => {
    const result = lookItUpSync(dir => containPkgJsonSync(dir), join(CWD, '..'))
    expect(result).toBe(null)
  })

  it('should throw an error if async matcher is provided', () => {
    expect.assertions(1)
    try {
      lookItUpSync(
        // @ts-expect-error: async matcher
        async dir => containPkgJsonSync(dir),
        join(CWD, '..')
      )
    } catch (err) {
      expect((err as Error).message).toBe("Async matcher can not be used in 'lookItUpSync'")
    }
  })
})
