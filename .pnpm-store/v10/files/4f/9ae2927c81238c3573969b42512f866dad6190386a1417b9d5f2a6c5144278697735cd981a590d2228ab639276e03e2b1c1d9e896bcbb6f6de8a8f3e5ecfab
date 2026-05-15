import { toProductionEntry } from '../../util/input.js';
import { hasDependency } from '../../util/plugin.js';
const title = 'tsdown';
const enablers = ['tsdown'];
const isEnabled = ({ dependencies }) => hasDependency(dependencies, enablers);
const config = ['tsdown.config.{ts,mts,cts,js,mjs,cjs,json}', 'package.json'];
const resolveConfig = async (config) => {
    if (typeof config === 'function')
        config = await config({});
    const entryPatterns = [config]
        .flat()
        .flatMap(config => {
        if (!config.entry)
            return [];
        if (Array.isArray(config.entry))
            return config.entry;
        return Object.values(config.entry);
    })
        .map(id => toProductionEntry(id, { allowIncludeExports: true }));
    return entryPatterns;
};
const args = {
    config: true,
};
const plugin = {
    title,
    enablers,
    isEnabled,
    config,
    resolveConfig,
    args,
};
export default plugin;
