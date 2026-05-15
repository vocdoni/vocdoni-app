import { toDependency, toEntry, toProductionEntry } from '../../util/input.js';
import { hasDependency } from '../../util/plugin.js';
import { getSrcDir } from './resolveFromAST.js';
const title = 'Astro';
const enablers = ['astro'];
const isEnabled = ({ dependencies }) => hasDependency(dependencies, enablers);
export const config = ['astro.config.{js,cjs,mjs,ts,mts}'];
const entry = ['src/content/config.ts', 'src/content.config.ts'];
const production = [
    'src/pages/**/*.{astro,mdx,js,ts}',
    '!src/pages/**/_*',
    '!src/pages/**/_*/**',
    'src/content/**/*.mdx',
    'src/middleware.{js,ts}',
    'src/actions/index.{js,ts}',
];
const resolveFromAST = sourceFile => {
    const srcDir = getSrcDir(sourceFile);
    const setSrcDir = (entry) => entry.replace(/^src\//, `${srcDir}/`);
    return [
        ...entry.map(setSrcDir).map(path => toEntry(path)),
        ...production.map(setSrcDir).map(path => toProductionEntry(path)),
    ];
};
const resolve = options => {
    const { manifest, isProduction } = options;
    const inputs = [];
    if (!isProduction &&
        manifest.scripts &&
        Object.values(manifest.scripts).some(script => /(?<=^|\s)astro(\s|\s.+\s)check(?=\s|$)/.test(script))) {
        inputs.push(toDependency('@astrojs/check'));
    }
    return inputs;
};
const plugin = {
    title,
    enablers,
    isEnabled,
    config,
    entry,
    production,
    resolveFromAST,
    resolve,
};
export default plugin;
