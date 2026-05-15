export { injectRollupInputs };
export { normalizeRollupInput };
import { assert } from './assert.js';
import { isObject } from './isObject.js';
import { isArray } from './isArray.js';
function injectRollupInputs(inputsNew, config) {
    const inputsCurrent = normalizeRollupInput(config.build.rollupOptions.input);
    const input = {
        ...inputsNew,
        ...inputsCurrent,
    };
    return input;
}
function normalizeRollupInput(input) {
    if (!input) {
        return {};
    }
    // Usually `input` is an object, but the user can set it as a `string` or `string[]`
    if (typeof input === 'string') {
        input = [input];
    }
    if (isArray(input)) {
        return Object.fromEntries(input.map((input) => [input, input]));
    }
    assert(isObject(input));
    return input;
}
