import { existsSync } from 'fs'
import { join } from 'path'
import { exists } from '../src'

export const CWD = join(__dirname, '..')
export const PKG_PATH = join(CWD, 'package.json')
export const BAR_PATH = join(CWD, '__tests__/fixtures/foo/bar')

export const contains = async (file: string, dir: string): Promise<string | null> =>
  (await exists(join(dir, file))) ? dir : null

export const containsSync = (file: string, dir: string): string | null =>
  existsSync(join(dir, file)) ? dir : null
