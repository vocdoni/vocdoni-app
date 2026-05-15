import { join } from 'path'
import { stop } from '../src'
import * as M from '../src/lookItUp'
import { MatcherSync } from '../src/types'
import { CWD, PKG_PATH, BAR_PATH, containsSync } from './utils'

const mockLookItUp = jest.spyOn(M, 'lookItUp')

describe('lookItUp', () => {
  it('should return Result if file exists', async () => {
    const result = await M.lookItUp('package.json', BAR_PATH)
    expect(result).toStrictEqual(PKG_PATH)
  })

  it('should be called 5 times to find package.json', async () => {
    await M.lookItUp('package.json', BAR_PATH)

    expect(mockLookItUp).toHaveBeenCalledTimes(5)

    const mockCalls = mockLookItUp.mock.calls
    expect(mockCalls[0]).toEqual(['package.json', BAR_PATH])
    expect(mockCalls[1]).toEqual(['package.json', join(BAR_PATH, '..')])
    expect(mockCalls[2]).toEqual(['package.json', join(BAR_PATH, '../..')])
    expect(mockCalls[3]).toEqual(['package.json', join(CWD, '__tests__')])
    expect(mockCalls[4]).toEqual(['package.json', CWD])
  })

  it('should be called 3 times if stop is returned from matcher function', async () => {
    const matcherSync: MatcherSync = (dir: string) =>
      dir === CWD ? stop : containsSync('fixture', dir)

    await M.lookItUp(matcherSync, BAR_PATH)

    expect(mockLookItUp).toHaveBeenCalledTimes(3)

    const mockCalls = mockLookItUp.mock.calls
    expect(mockCalls[0]).toEqual([matcherSync, BAR_PATH])
    expect(mockCalls[1]).toEqual([matcherSync, join(BAR_PATH, '..')])
    expect(mockCalls[2]).toEqual([matcherSync, join(CWD, '__tests__/fixtures')])
  })

  it('should be called 6 times if directory is not found', async () => {
    const matcherSync: MatcherSync = (dir: string) =>
      dir === join(CWD, '..') ? stop : containsSync('no_such_file', dir)

    await M.lookItUp(matcherSync, BAR_PATH)

    expect(mockLookItUp).toHaveBeenCalledTimes(6)

    const mockCalls = mockLookItUp.mock.calls
    expect(mockCalls[0]).toEqual([matcherSync, BAR_PATH])
    expect(mockCalls[1]).toEqual([matcherSync, join(BAR_PATH, '..')])
    expect(mockCalls[2]).toEqual([matcherSync, join(BAR_PATH, '../..')])
    expect(mockCalls[3]).toEqual([matcherSync, join(CWD, '__tests__')])
    expect(mockCalls[4]).toEqual([matcherSync, CWD])
    expect(mockCalls[5]).toEqual([matcherSync, join(CWD, '..')])
  })
})
