export { pluginViteConfigVikeExtensions };
import { mergeConfig } from 'vite';
import { assertUsage } from '../../../utils/assert.js';
import { isCallable } from '../../../utils/isCallable.js';
import { isObject } from '../../../utils/isObject.js';
import '../assertEnvVite.js';
// Apply +vite
// - For example, Vike extensions adding Vite plugins
async function pluginViteConfigVikeExtensions(vikeConfig) {
    if (vikeConfig === null)
        return [];
    let viteConfigFromExtensions = {};
    const viteConfigsExtensions = vikeConfig._from.configsCumulative.vite;
    if (!viteConfigsExtensions)
        return [];
    await Promise.all(viteConfigsExtensions.values.map(async (v) => {
        let val = v.value;
        if (isCallable(val))
            val = await val();
        assertUsage(isObject(val), `${v.definedAt} should be an object, or a function returning an object`);
        viteConfigFromExtensions = mergeConfig(viteConfigFromExtensions, val);
    }));
    const pluginsFromExtensions = (viteConfigFromExtensions.plugins ?? []);
    delete viteConfigFromExtensions.plugins;
    // Avoid infinite loop
    assertUsage(!pluginsFromExtensions.some((p) => p.name?.startsWith('vike:')), "Adding Vike's Vite plugin using +vite is forbidden");
    return [
        ...pluginsFromExtensions,
        {
            name: 'vike:pluginViteConfigVikeExtensions',
            config: {
                handler(_config) {
                    return viteConfigFromExtensions;
                },
            },
        },
    ];
}
