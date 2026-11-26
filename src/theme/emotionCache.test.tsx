import { afterEach, describe, expect, it, vi } from 'vitest'

// Emotion picks its server or browser build from `document` when its modules load, and this file runs under jsdom.
// Load a fresh copy of the modules with no `document`, as the SSR bundle does, and render from it.
const loadServerModules = async () => {
  vi.resetModules()
  vi.stubGlobal('document', undefined)
  try {
    const [theme, appEnv, appEnvBuild, system, server, chakra] = await Promise.all([
      import('./Theme'),
      import('~src/app-env'),
      import('~src/app-env-build'),
      import('./system'),
      import('react-dom/server'),
      import('@chakra-ui/react'),
    ])
    return { ...theme, ...appEnv, ...appEnvBuild, system, server, chakra }
  } finally {
    vi.unstubAllGlobals()
  }
}

// One server render of the app's Theme, the way the SSR pages mount it.
const renderPage = async (modules: Awaited<ReturnType<typeof loadServerModules>>, primaryColor: string) => {
  const { AppEnvProvider, buildAppEnv, Theme, server, chakra } = modules
  return server.renderToString(
    <AppEnvProvider value={buildAppEnv({ PRIMARY_COLOR: '#1d62e9' })}>
      <Theme primaryColor={primaryColor}>
        <chakra.Box bg='accent.solid' color='accent.contrast' p='4'>
          branded
        </chakra.Box>
      </Theme>
    </AppEnvProvider>
  )
}

const classNames = (html: string) => html.match(/class="[^"]*"/g)
// The emotion name of the first element's class (`css-<name>`), as its <style> tag spells it: `css <name>`.
const ruleName = (html: string) => /class="css-([^"]*)"/.exec(html)?.[1]

describe('Theme, server render', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // Each server render must carry the component rules: emotion only returns a rule's text the first time its cache
  // sees it, so a cache reused across requests would leave later pages without their component CSS.
  it('carries the component rules on every render of the same colour', async () => {
    const modules = await loadServerModules()
    const first = await renderPage(modules, '#fff59d')
    const second = await renderPage(modules, '#fff59d')
    const box = ruleName(second)
    expect(first).toContain(`<style data-emotion="css ${box}"`)
    expect(second).toContain(`<style data-emotion="css ${box}"`)
    expect(second.match(/<style data-emotion="css /g)?.length).toBe(first.match(/<style data-emotion="css /g)?.length)
  })

  // The browser hydrates the markup against the default cache (key `css`), which matches it by class name.
  it('renders the same class names as the default cache, so hydration matches', async () => {
    const modules = await loadServerModules()
    const withTheme = classNames(await renderPage(modules, '#fff59d'))
    const direct = modules.server.renderToString(
      <modules.chakra.ChakraProvider value={modules.system.createAppSystem('#fff59d')}>
        <modules.chakra.Box bg='accent.solid' color='accent.contrast' p='4'>
          branded
        </modules.chakra.Box>
      </modules.chakra.ChakraProvider>
    )
    expect(withTheme).toEqual(classNames(direct))
  })
})
