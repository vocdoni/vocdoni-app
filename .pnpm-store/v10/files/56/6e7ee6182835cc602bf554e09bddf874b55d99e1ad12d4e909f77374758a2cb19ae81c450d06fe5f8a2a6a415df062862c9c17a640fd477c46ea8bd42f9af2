import { hasDependency } from '../../util/plugin.js';
const title = 'Tailwind';
const enablers = ['tailwindcss'];
const isEnabled = ({ dependencies }) => hasDependency(dependencies, enablers);
const entry = ['tailwind.config.{js,cjs,mjs,ts}'];
const plugin = {
    title,
    enablers,
    isEnabled,
    entry,
};
export default plugin;
