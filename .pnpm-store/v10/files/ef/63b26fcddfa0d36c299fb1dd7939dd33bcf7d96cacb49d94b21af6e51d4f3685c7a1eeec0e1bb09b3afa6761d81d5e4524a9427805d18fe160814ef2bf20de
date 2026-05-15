import { isFile } from '../../util/fs.js';
const title = 'Yarn';
const enablers = 'This plugin is enabled when a `yarn.lock` file is found in the root folder.';
const isEnabled = async ({ cwd }) => isFile(cwd, 'yarn.lock');
const isRootOnly = true;
const entry = ['yarn.config.cjs'];
const plugin = {
    title,
    enablers,
    isEnabled,
    isRootOnly,
    entry,
};
export default plugin;
