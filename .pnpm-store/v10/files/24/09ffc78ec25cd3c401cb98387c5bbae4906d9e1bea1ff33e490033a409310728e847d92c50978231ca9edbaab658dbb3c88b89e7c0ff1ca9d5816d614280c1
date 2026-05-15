export { stringifyKey };
export { assertKey };
import { stringify } from '@brillout/json-serializer/stringify';
import { isCallable } from '../utils/isCallable.js';
import { assertUsage } from './utils.js';
function stringifyKey(key) {
    const keyString = stringify(key, { sortObjectKeys: true });
    return keyString;
}
function assertKey(keyValue) {
    assertUsage(keyValue, `[useAsync(key, asyncFn)] You provided a \`key\` with the value \`${keyValue}\` which is forbidden.`);
    assertUsage(!isCallable(keyValue), `[useAsync(key, asyncFn)] You provided a \`key\` that is a function which is forbidden.`);
}
