export { findRollupBundleEntry };
import { assert, assertUsage } from './assert.js';
import { isNotNullish } from './isNullish.js';
import path from 'path';
import pc from '@brillout/picocolors';
import { usageHintRollupEntryNames } from '../shared/usageHints.js';
// - `entry.name` can be `undefined` (which is unexpected)
//   - It's unexpected in both situations:
//     - If we use injectRollupInputs() then we explicitly set the name to `entryName`
//     - If we use this.emitFile() then we also explicitly set the name to `entryName`
//   - I think (I ain't sure) `name` can be `undefined` only when using this.emitFile()
//   - https://github.com/brillout/vite-plugin-server-entry/issues/18
// - Weird randomness of `entryName` being included twice: https://github.com/brillout/vite-plugin-server-entry/issues/20
//   - We use `key.startsWith(keyStart)` to pick the right one
function findRollupBundleEntry(entryName, bundle, outDir) {
    let found = null;
    let foundWithWrongOutputPath = null;
    const keyStart = `${entryName}.`;
    for (const key in bundle) {
        if (key.endsWith('.map'))
            continue; // https://github.com/brillout/vite-plugin-ssr/issues/612
        const entry = bundle[key];
        if (entry.name === entryName || key.startsWith(keyStart)) {
            if (!key.startsWith(keyStart)) {
                foundWithWrongOutputPath = key;
            }
            else {
                if (found) {
                    assert(false, {
                        entryName,
                        names: Object.values(bundle)
                            .map((entry) => entry.name)
                            .filter(isNotNullish),
                        keys: Object.keys(bundle),
                    });
                }
                found = entry;
            }
        }
    }
    if (!found && foundWithWrongOutputPath) {
        const pathActual = path.posix.join(outDir, 'server', foundWithWrongOutputPath);
        const pathCorect = path.posix.join(outDir, 'server', 'entry.{js,mjs}');
        assertUsage(false, `Found build server entry ${pc.cyan(entryName)} (as expected) but it's saved at ${pc.bold(pc.red(pathActual))} which is unexpected: it should be saved at ${pc.bold(pc.green(pathCorect))} instead. ${usageHintRollupEntryNames}.`);
    }
    return found;
}
