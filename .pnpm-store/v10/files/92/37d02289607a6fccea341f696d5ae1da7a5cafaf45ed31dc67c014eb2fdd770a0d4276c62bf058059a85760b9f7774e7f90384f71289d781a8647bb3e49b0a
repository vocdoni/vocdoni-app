import { toAlias, toDependency, toEntry, toIgnore, toProductionEntry } from '../../util/input.js';
import { hasDependency } from '../../util/plugin.js';
import { CORE_CLIENT_API, resolveConfigItems } from './helpers.js';
const title = 'Docusaurus';
const enablers = ['@docusaurus/core'];
const isEnabled = ({ dependencies }) => hasDependency(dependencies, enablers);
const config = ['docusaurus.config.{js,mjs,ts}'];
const production = ['src/pages/**/*.{js,ts,jsx,tsx}', '{blog,docs}/**/*.mdx', 'versioned_docs/**/*.{mdx,jsx,tsx}'];
const entry = ['babel.config.{js,cjs,mjs,cts}'];
const resolveConfig = async (config, options) => {
    const themes = await resolveConfigItems(config.themes ?? [], 'theme', options);
    const plugins = await resolveConfigItems(config.plugins ?? [], 'plugin', options);
    const presets = await resolveConfigItems(config.presets ?? [], 'preset', options);
    const hasClassicTheme = options.manifest.dependencies?.['@docusaurus/theme-classic'] ||
        options.manifest.dependencies?.['@docusaurus/preset-classic'];
    return [
        toAlias('@site/*', './*'),
        toDependency('@docusaurus/module-type-aliases', { optional: true }),
        ...(hasClassicTheme ? [toIgnore('(@theme|@theme-init|@theme-original)/*', 'dependencies')] : []),
        toIgnore(`@docusaurus/(${CORE_CLIENT_API.join('|')})`, 'dependencies'),
        ...production.map(id => toProductionEntry(id)),
        ...entry.map(id => toEntry(id)),
        ...themes,
        ...plugins,
        ...presets,
    ];
};
const plugin = {
    title,
    enablers,
    isEnabled,
    config,
    entry,
    production,
    resolveConfig,
};
export default plugin;
