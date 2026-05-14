import { toDependency } from '../../util/input.js';
import { hasDependency } from '../../util/plugin.js';
import { resolveConfig } from '../vitest/index.js';
import { getReactBabelPlugins } from './helpers.js';
const title = 'Vite';
const enablers = ['vite', 'vitest'];
const isEnabled = ({ dependencies }) => hasDependency(dependencies, enablers);
export const config = ['vite.config.{js,mjs,ts,cjs,mts,cts}'];
const resolveFromAST = (sourceFile) => {
    const babelPlugins = getReactBabelPlugins(sourceFile);
    return babelPlugins.map(plugin => toDependency(plugin));
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
    resolveFromAST,
    args,
};
export default plugin;
