import parseArgs from 'minimist';
import { toEntry } from '../../util/input.js';
const title = 'Bun';
const enablers = ['bun'];
const hasBunTest = (scripts) => scripts && Object.values(scripts).some(script => /(?<=^|\s)bun test/.test(script));
const isEnabled = ({ manifest }) => !!hasBunTest(manifest.scripts);
const patterns = ['**/*.{test,spec}.{js,jsx,ts,tsx}', '**/*_{test,spec}.{js,jsx,ts,tsx}'];
const resolve = options => {
    const scripts = { ...options.rootManifest?.scripts, ...options.manifest.scripts };
    for (const script of Object.values(scripts)) {
        if (/(?<=^|\s)bun test/.test(script)) {
            const parsed = parseArgs(script.split(' '));
            if (parsed._.filter(id => id !== 'bun' && id !== 'test').length === 0) {
                return patterns.map(toEntry);
            }
        }
    }
    return [];
};
const plugin = {
    title,
    enablers,
    isEnabled,
    resolve,
};
export default plugin;
