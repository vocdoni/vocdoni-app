export { pluginReplaceConstantsGlobalThis };
export { VIRTUAL_FILE_ID_constantsGlobalThis };
import { isDebug } from '../../../utils/debug.js';
import { escapeRegex } from '../../../utils/escapeRegex.js';
import { addVirtualFileIdPrefix } from '../../../utils/virtualFileId.js';
import { assert } from '../../../utils/assert.js';
import { isViteServerSide_applyToEnvironment, isViteServerSide_configEnvironment, isViteServerSide_extraSafe, } from '../shared/isViteServerSide.js';
import '../assertEnvVite.js';
const VIRTUAL_FILE_ID_constantsGlobalThis = 'virtual:vike:server:constantsGlobalThis';
const isDebugVal = isDebug();
globalThis.__VIKE__IS_CLIENT = false;
globalThis.__VIKE__IS_DEBUG = isDebugVal;
// === Rolldown filter
const filterRolldown = {
    id: {
        include: new RegExp(escapeRegex(VIRTUAL_FILE_ID_constantsGlobalThis)),
    },
};
const filterFunction = (id) => id === VIRTUAL_FILE_ID_constantsGlobalThis || id === addVirtualFileIdPrefix(VIRTUAL_FILE_ID_constantsGlobalThis);
// ===
function pluginReplaceConstantsGlobalThis() {
    let config;
    let isDev;
    return [
        {
            name: 'vike:pluginReplaceConstantsGlobalThis:define',
            config: {
                handler(config) {
                    assert(typeof config._isDev === 'boolean');
                    isDev = config._isDev;
                    globalThis.__VIKE__IS_DEV = isDev;
                    return {
                        define: {
                            'globalThis.__VIKE__IS_DEV': JSON.stringify(isDev),
                            'globalThis.__VIKE__IS_DEBUG': JSON.stringify(isDebugVal),
                            'globalThis.__VIKE__NO_EXTERNAL': 'true',
                        },
                    };
                },
            },
            configEnvironment: {
                order: 'pre',
                handler(name, config) {
                    const isClientSide = !isViteServerSide_configEnvironment(name, config);
                    return {
                        consumer: isClientSide ? 'client' : 'server',
                        define: {
                            'globalThis.__VIKE__IS_CLIENT': JSON.stringify(isClientSide),
                        },
                    };
                },
            },
            configResolved(config_) {
                config = config_;
            },
        },
        {
            name: 'vike:pluginReplaceConstantsGlobalThis:virtual-file',
            // We only need the virtual file for the server-side (for node_modules/ packages with ssr.external) — the `define` values above always apply to the client-side.
            applyToEnvironment(env) {
                return isViteServerSide_applyToEnvironment(env);
            },
            resolveId: {
                filter: filterRolldown,
                handler(id) {
                    assert(filterFunction(id));
                    assert(id === VIRTUAL_FILE_ID_constantsGlobalThis);
                    return addVirtualFileIdPrefix(id);
                },
            },
            load: {
                filter: filterRolldown,
                handler(id, options) {
                    assert(filterFunction(id));
                    assert(isViteServerSide_extraSafe(config, this.environment, options));
                    assert(typeof isDev === 'boolean');
                    const code = [
                        `globalThis.__VIKE__IS_DEV = ${JSON.stringify(isDev)};`,
                        `globalThis.__VIKE__IS_CLIENT = false;`,
                        `globalThis.__VIKE__IS_DEBUG = ${JSON.stringify(isDebugVal)};`,
                    ].join('\n');
                    return code;
                },
            },
        },
    ];
}
