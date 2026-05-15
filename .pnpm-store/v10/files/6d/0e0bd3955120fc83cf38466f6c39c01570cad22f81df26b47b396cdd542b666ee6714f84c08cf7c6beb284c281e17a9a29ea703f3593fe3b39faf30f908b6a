export { assertIsNotProductionRuntime };
export { onSetupRuntime };
export { onSetupBuild };
export { onSetupPrerender };
export { onSetupPreview };
export { setNodeEnvProductionIfUndefined };
export { markSetup_viteDevServer };
export { markSetup_vitePreviewServer };
export { markSetup_vikeVitePlugin };
export { markSetup_isViteDev };
import { assert, assertUsage, assertWarning } from './assert.js';
import { assertIsNotBrowser } from './assertIsNotBrowser.js';
import { createDebug } from './debug.js';
import { getGlobalObject } from './getGlobalObject.js';
import { isNonRunnableDevProcess } from './isNonRunnableDevProcess.js';
import { isVitest } from './isVitest.js';
import pc from '@brillout/picocolors';
assertIsNotBrowser();
const debug = createDebug('vike:setup');
const setup = getGlobalObject('utils/assertSetup.ts', {});
// Called by Vike modules that want to ensure that they aren't loaded by the server runtime in production
function assertIsNotProductionRuntime() {
    if (debug.isActivated)
        debug('assertIsNotProductionRuntime()', new Error().stack);
    setup.shouldNotBeProduction = true;
}
function onSetupRuntime() {
    if (debug.isActivated)
        debug('assertSetup()', new Error().stack);
    if (isTest())
        return;
    assertNodeEnvIsNotUndefinedString();
    if (!setup.viteDevServer && setup.isViteDev === undefined) {
        // TO-DO/eventually: make it assertUsage() again once https://github.com/vikejs/vike/issues/1528 is implemented.
        assertWarning(!isNodeEnvDev() || isNonRunnableDevProcess(), `The ${getEnvDescription()}, which is contradictory because the environment seems to be a production environment (Vite isn't loaded), see ${pc.underline('https://vike.dev/NODE_ENV')} and ${pc.underline('https://vike.dev/warning/setup')}`, { onlyOnce: true });
        assertUsage(!setup.vikeVitePlugin, `Vike's Vite plugin (the ${pc.cyan('vike/plugin')} module) shouldn't be loaded in production, see ${pc.underline('https://vike.dev/warning/setup')}`);
        // This assert() one of the main goal of this file: it implements assertIsNotProductionRuntime()
        assert(!setup.shouldNotBeProduction);
    }
    else {
        if (!setup.isPreview && !setup.vitePreviewServer && !setup.isPrerendering) {
            // TO-DO/eventually: make it assertUsage() again once https://github.com/vikejs/vike/issues/1528 is implemented.
            assertWarning(isNodeEnvDev(), `The ${getEnvDescription()} while Vite is loaded, but Vite shouldn't be loaded in production, see ${pc.underline('https://vike.dev/warning/setup')}`, { onlyOnce: true });
        }
        assert(setup.vikeVitePlugin);
        assert(setup.shouldNotBeProduction);
    }
}
// Ensure NODE_ENV is 'production' when building.
// - Used by both Vue and React for bundling minified version:
//   - Vue: https://github.com/vuejs/core/blob/f66a75ea75c8aece065b61e2126b4c5b2338aa6e/packages/vue/index.js
//   - React: https://github.com/facebook/react/blob/01ab35a9a731dec69995fbd28f3ac7eaad11e183/packages/react/npm/index.js
// - Required for React: setting NODE_ENV to a value other than 'production' triggers an error: https://github.com/vikejs/vike/issues/1469#issuecomment-1969301797
// - Not required for Vue: when building the app, NODE_ENV can be set to a value other than 'production', e.g. 'development'.
function onSetupBuild() {
    assertUsageNodeEnvIsNotDev('building');
    /* Not needed: Vite already sets `process.env.NODE_ENV = 'production'`
    setNodeEnvProductionIfUndefined()
    */
}
// Called by ../node/prerender/runPrerender.ts
function onSetupPrerender() {
    markSetup_isPrerendering();
    if (getNodeEnv())
        assertUsageNodeEnvIsNotDev('pre-rendering');
    setNodeEnvProductionIfUndefined();
}
// Called by ../node/api/preview.ts
function onSetupPreview() {
    markSetup_isPreview();
}
function isTest() {
    return isVitest() || isNodeEnv('test');
}
// Called by Vite hook configureServer()
function markSetup_viteDevServer() {
    if (debug.isActivated)
        debug('markSetup_viteDevServer()', new Error().stack);
    setup.viteDevServer = true;
}
// Called by Vite hook configurePreviewServer()
function markSetup_vitePreviewServer() {
    if (debug.isActivated)
        debug('markSetup_vitePreviewServer()', new Error().stack);
    setup.vitePreviewServer = true;
}
// Called by ../node/vite/index.ts
function markSetup_vikeVitePlugin() {
    if (debug.isActivated)
        debug('markSetup_vikeVitePlugin()', new Error().stack);
    setup.vikeVitePlugin = true;
}
// Whether Vite is loaded and whether it's in dev mode (the value returned by `isDevCheck()`)
function markSetup_isViteDev(isViteDev) {
    if (debug.isActivated)
        debug('markSetup_isViteDev()', new Error().stack);
    setup.isViteDev = isViteDev;
}
function markSetup_isPrerendering() {
    if (debug.isActivated)
        debug('markSetup_isPrerendering()', new Error().stack);
    setup.isPrerendering = true;
}
function markSetup_isPreview() {
    if (debug.isActivated)
        debug('markSetup_isPreview()', new Error().stack);
    setup.isPreview = true;
}
function assertUsageNodeEnvIsNotDev(operation) {
    if (!isNodeEnvDev())
        return;
    // TO-DO/eventually: make it assertUsage() again once https://github.com/vikejs/vike/issues/1528 is implemented.
    assertWarning(false, `The ${getEnvDescription()} upon ${operation} which shouldn't be the case, see ${pc.underline('https://vike.dev/NODE_ENV')}`, { onlyOnce: true });
}
function getEnvDescription() {
    const envType = `${(isNodeEnvDev() ? 'development' : 'production')} environment`;
    const nodeEnvDesc = `environment is set to be a ${pc.bold(envType)} by ${pc.cyan(`process.env.NODE_ENV===${JSON.stringify(getNodeEnv())}`)}`;
    return nodeEnvDesc;
}
// For example, Wrangler bug replaces `process.env.NODE_ENV` with `"undefined"`
// https://github.com/cloudflare/workers-sdk/issues/7886
function assertNodeEnvIsNotUndefinedString() {
    const nodeEnv = getNodeEnv();
    assertWarning(nodeEnv !== 'undefined', `${pc.cyan('process.env.NODE_ENV==="undefined"')} which is unexpected: ${pc.cyan('process.env.NODE_ENV')} is allowed to be the *value* ${pc.cyan('undefined')} (i.e. ${pc.cyan('process.env.NODE_ENV===undefined')}) but it shouldn't be the *string* ${pc.cyan('"undefined"')} — see ${pc.underline('https://vike.dev/NODE_ENV')}`, { onlyOnce: true });
}
function isNodeEnvDev() {
    const nodeEnv = getNodeEnv();
    // That's quite strict, let's see if some user complains
    return nodeEnv === undefined || isNodeEnv(['development', 'dev', '']);
}
function isNodeEnv(value) {
    const values = Array.isArray(value) ? value : [value];
    const nodeEnv = getNodeEnv();
    return nodeEnv !== undefined && values.includes(nodeEnv.toLowerCase());
}
function getNodeEnv() {
    let val;
    try {
        val = process.env.NODE_ENV;
    }
    catch {
        return undefined;
    }
    /*
    // Should we show the following warning? So far I don't think so because of the following. Maybe we can show it once we enable users to disable warnings.
    // - The warning isn't always actionable, e.g. if it's a tool that dynamically sets `process.env.NODE_ENV`.
    // - We assume that tools use `process.env.NODE_ENV` and not something like `const { env } = process; env.NODE_ENV`. Thus, in practice, `val` overrides `val2` so having `val!==val2` isn't an issue.
    {
      const val2 = process.env['NODE' + '_ENV']
      if (val2)
        assertWarning(
          val === val2,
          `Dynamically setting process.env.NODE_ENV to ${val2} hasn't any effect because process.env.NODE_ENV is being statically replaced to ${val}.`,
          { onlyOnce: true }
        )
    }
    //*/
    return val;
}
function setNodeEnvProductionIfUndefined() {
    // The statement `process.env['NODE_ENV'] = 'production'` chokes webpack v4
    let val;
    let proc;
    try {
        proc = process;
        val = process.env.NODE_ENV;
    }
    catch {
        return;
    }
    if (val !== undefined)
        return;
    const { env } = proc;
    env.NODE_ENV ?? (env.NODE_ENV = 'production');
    assert(isNodeEnv('production'));
}
