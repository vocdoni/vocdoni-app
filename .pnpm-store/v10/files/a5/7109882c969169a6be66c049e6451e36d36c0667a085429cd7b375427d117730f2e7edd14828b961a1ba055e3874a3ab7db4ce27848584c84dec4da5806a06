export { metaBuiltIn };
import { assert, assertUsage } from '../../../../utils/assert.js';
import { getConfigDefinedAt, } from '../../../../shared-server-client/page-configs/getConfigDefinedAt.js';
import { getConfigValueSourceRelevantAnyEnv, getConfigValueSourcesRelevant, isConfigSourceValueNull, } from '../../plugins/pluginVirtualFiles/getConfigValueSourcesRelevant.js';
import { getFileSuffixes } from '../../../../shared-server-node/getFileSuffixes.js';
import '../../assertEnvVite.js';
const metaBuiltIn = {
    onRenderHtml: {
        env: { server: true },
    },
    onRenderClient: {
        env: { client: true },
    },
    onHydrationEnd: {
        env: { client: true },
    },
    onPageTransitionStart: {
        env: { client: true },
    },
    onPageTransitionEnd: {
        env: { client: true },
    },
    onCreatePageContext: {
        env: { server: true, client: true },
        cumulative: true,
    },
    onCreateGlobalContext: {
        env: { server: true, client: true },
        global: true,
        cumulative: true,
    },
    onError: {
        env: { server: true },
        global: true,
        cumulative: true,
    },
    onHookCall: {
        env: { server: true },
        global: true,
        cumulative: true,
    },
    onBeforeRender: {
        env: { server: true },
    },
    Page: {
        env: { server: true, client: true },
    },
    passToClient: {
        env: { server: true },
        cumulative: true,
    },
    route: {
        env: {
            server: true,
            client: 'if-client-routing',
            // For vite-plugin-vercel
            config: true,
        },
        eager: true,
    },
    guard: {
        env: { server: true, client: 'if-client-routing' },
    },
    data: {
        env: { server: true },
    },
    onData: {
        env: { server: true, client: true },
        cumulative: true,
    },
    iKnowThePerformanceRisksOfAsyncRouteFunctions: {
        env: { server: true, client: 'if-client-routing' },
        eager: true,
    },
    filesystemRoutingRoot: {
        env: { config: true },
    },
    client: {
        // The value of the client config is merely the file path to the client entry file, which is only needed on the sever-side
        env: { server: true, config: true },
        _valueIsFilePath: true,
    },
    clientRouting: {
        // We could make it { client: false } but we don't yet because of some legacy V0.4 design code
        env: { server: true, client: true, config: true },
        eager: true,
    },
    clientHooks: {
        env: { config: true },
    },
    hydrationCanBeAborted: {
        env: { client: true },
    },
    prefetch: {
        env: { client: true },
        eager: true,
    },
    // TO-DO/next-major-release: remove
    prefetchStaticAssets: {
        env: { client: true },
    },
    extends: {
        env: { config: true },
    },
    meta: {
        env: { config: true },
    },
    hasServerOnlyHook: {
        env: { client: true },
        eager: true,
        _computed: (pageConfig) => {
            const sources = ['data', 'onBeforeRender', 'onCreatePageContext', 'guard']
                .map((hookName) => getConfigValueSourcesRelevant(hookName, {
                isForClientSide: false,
                // TO-DO/eventually/remove-server-router: let's eventually remove support for Server Routing
                isClientRouting: true,
            }, pageConfig))
                .flat(1)
                // Server-only
                .filter((source) => !source.configEnv.client)
                // Exclude `.ssr.js` hooks (they don't require pageContext.json requests)
                .filter((source) => {
                const { definedAt } = source;
                if ('fileName' in definedAt && getFileSuffixes(definedAt.fileName).includes('ssr')) {
                    return false;
                }
                return true;
            })
                // Config value isn't `null`
                .filter((source) => !isConfigSourceValueNull(source));
            return sources.length > 0;
        },
    },
    // Whether the page loads:
    //  - Vike's client runtime
    //  - User's client hooks
    // In other words, whether the page is "HTML-only" (https://vike.dev/render-modes). HTML-only pages shouldn't load the client runtime nor client hooks.
    isClientRuntimeLoaded: {
        env: { server: true, client: true },
        eager: true,
        _computed: (pageConfig) => {
            {
                const source = getConfigValueSourceRelevantAnyEnv('clientHooks', pageConfig);
                if (source) {
                    assert(source.valueIsLoaded);
                    const { value, definedAt } = source;
                    const configDefinedAt = getConfigDefinedAt('Config', 'clientHooks', definedAt);
                    assertUsage(typeof value === 'boolean', `${configDefinedAt} should be a boolean`);
                    return value;
                }
            }
            return (isConfigSet(pageConfig, 'onRenderClient') &&
                isConfigSet(pageConfig, 'Page') &&
                !!getConfigEnv(pageConfig, 'Page')?.client);
        },
    },
    // TO-DO/soon/cumulative-hooks: remove and replace with new computed prop `clientOnlyHooks: string[]` (see other TO-DO/soon/cumulative-hooks comments)
    onBeforeRenderEnv: {
        env: { client: true },
        eager: true,
        _computed: (pageConfig) => {
            return !isConfigSet(pageConfig, 'onBeforeRender') ? null : getConfigEnv(pageConfig, 'onBeforeRender');
        },
    },
    // TO-DO/soon/cumulative-hooks: remove and replace with new computed prop `clientOnlyHooks: string[]` (see other TO-DO/soon/cumulative-hooks comments)
    dataEnv: {
        env: { client: true },
        eager: true,
        _computed: (pageConfig) => {
            return !isConfigSet(pageConfig, 'data') ? null : getConfigEnv(pageConfig, 'data');
        },
    },
    // TO-DO/soon/cumulative-hooks: remove and replace with new computed prop `clientOnlyHooks: string[]` (see other TO-DO/soon/cumulative-hooks comments)
    guardEnv: {
        env: { client: true },
        eager: true,
        _computed: (pageConfig) => {
            return !isConfigSet(pageConfig, 'guard') ? null : getConfigEnv(pageConfig, 'guard');
        },
    },
    hooksTimeout: {
        env: { server: true, client: true },
    },
    cacheControl: {
        env: { server: true },
    },
    host: {
        env: { config: true },
        global: true,
        vite: true,
    },
    port: {
        env: { config: true },
        global: true,
        vite: true,
    },
    mode: {
        env: { config: true },
        global: true,
        vite: true,
    },
    force: {
        env: { config: true },
        global: true,
        vite: true,
    },
    csp: {
        env: { server: true },
    },
    injectScriptsAt: {
        env: { server: true },
    },
    name: {
        env: { config: true },
    },
    require: {
        env: { config: true },
    },
    keepScrollPosition: {
        env: { client: true },
    },
    middleware: {
        env: { server: true },
        cumulative: true,
        eager: true,
        global: true,
    },
    server: {
        env: { server: true },
        global: true,
    },
    cli: {
        env: { config: true },
        global: true,
    },
    onBeforeRoute: {
        env: { server: true, client: 'if-client-routing' },
        eager: true,
        global: true,
    },
    prerender: {
        env: { config: true },
        global: (value, { isGlobalLocation }) => typeof value === 'object' || isGlobalLocation,
        cumulative: true,
    },
    onPrerenderStart: {
        env: { server: true, production: true },
        eager: true,
        global: true,
    },
    onBeforePrerenderStart: {
        env: { server: true, production: true },
    },
    vite: {
        env: { config: true },
        cumulative: true,
        global: true,
        vite: true,
    },
    disableAutoFullBuild: {
        env: { config: true },
        global: true,
    },
    // This is deprecated (since Summer 2025). But don't remove this (yet) — otherwise it will break older Vike extensions that still use it.
    vite6BuilderApp: {
        env: { config: true },
        global: true,
        vite: true,
    },
    includeAssetsImportedByServer: {
        env: { config: true },
        global: true,
        vite: true,
    },
    baseAssets: {
        env: { config: true, server: true },
        global: true,
        vite: true,
    },
    baseServer: {
        env: { config: true, server: true },
        global: true,
        vite: true,
    },
    redirects: {
        env: { server: true },
        global: true,
        cumulative: true,
    },
    trailingSlash: {
        env: { server: true },
        global: true,
    },
    disableUrlNormalization: {
        env: { server: true },
        global: true,
    },
    headersResponse: {
        env: { server: true },
        cumulative: true,
    },
    staticReplace: {
        env: { config: true },
        cumulative: true,
        global: true,
        vite: true,
    },
    license: {
        env: { config: true },
        global: true,
    },
    vercel: {
        env: { config: true },
    },
};
function getConfigEnv(pageConfig, configName) {
    const source = getConfigValueSourceRelevantAnyEnv(configName, pageConfig);
    if (!source)
        return null;
    const { configEnv } = source;
    const env = {};
    if (configEnv.client)
        env.client = true;
    if (configEnv.server)
        env.server = true;
    return env;
}
function isConfigSet(pageConfig, configName) {
    const source = getConfigValueSourceRelevantAnyEnv(configName, pageConfig);
    return !!source;
}
