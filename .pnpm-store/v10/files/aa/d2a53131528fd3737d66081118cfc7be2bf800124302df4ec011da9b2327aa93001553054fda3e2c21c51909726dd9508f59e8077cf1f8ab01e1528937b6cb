export { assertKeys };
import pc from '@brillout/picocolors';
import { assertUsage } from './assert.js';
import { joinEnglish } from './joinEnglish.js';
function assertKeys(obj, keysExpected, errPrefix) {
    const keysUnknown = [];
    const keys = Object.keys(obj);
    for (const key of keys) {
        if (!keysExpected.includes(key)) {
            keysUnknown.push(key);
        }
    }
    if (keysUnknown.length !== 0) {
        assertUsage(false, [
            errPrefix,
            `unknown key${keysUnknown.length === 1 ? '' : 's'}`,
            joinEnglish(keysUnknown, 'and', { color: pc.cyan }) + '.',
            'Only following keys are allowed:',
            joinEnglish(keysExpected, 'and', { color: pc.cyan }) + '.',
        ].join(' '));
    }
}
