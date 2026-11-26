import createCache, { type EmotionCache, type StylisPlugin } from '@emotion/cache'
import { prefixer } from 'stylis'
import type { AppSystem } from './system'

// Emotion memoizes server rules per plugin array, and the default array is shared by every cache, so a colour's rules
// would outlive the colour. One array per system ties them to the system the colour memo evicts.
const pluginsBySystem = new WeakMap<AppSystem, StylisPlugin[]>()
// Read once, as emotion does when it loads: the browser build has no server map to avoid.
const isBrowser = typeof document !== 'undefined'

/**
 * The cache for one server render of `system`, or undefined in the browser (which keeps emotion's default cache). A
 * new cache per render, because emotion returns a rule's text only the first time its cache sees it. Same key (`css`)
 * as the default, so class names match. The prefixer is stylis's: a few vendor prefixes differ from emotion's (such
 * as summary's -webkit-box and scrollbar-gutter's), which only affects server-rendered CSS text.
 */
export const serverCacheFor = (system: AppSystem): EmotionCache | undefined => {
  if (isBrowser) return undefined
  let plugins = pluginsBySystem.get(system)
  if (!plugins) {
    plugins = [prefixer]
    pluginsBySystem.set(system, plugins)
  }
  return createCache({ key: 'css', stylisPlugins: plugins })
}
