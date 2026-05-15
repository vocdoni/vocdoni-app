export { genPromise };
// Simple implementation without timeout: https://github.com/vikejs/vike/blob/2e59b922e7e0f227d26018dc2b74877c9b0f581b/vike/utils/genPromise.ts
import { assert, assertWarning } from './assert.js';
import { humanizeTime } from './humanizeTime.js';
const timeoutDefault = 25 * 1000;
function genPromise({ timeout = timeoutDefault, } = {}) {
    let resolve;
    let reject;
    let finished = false;
    const promise_internal = new Promise((resolve_, reject_) => {
        resolve = (...args) => {
            finished = true;
            timeoutClear();
            return resolve_(...args);
        };
        reject = (...args) => {
            finished = true;
            timeoutClear();
            return reject_(...args);
        };
    });
    const timeoutClear = () => timeouts.forEach((t) => clearTimeout(t));
    const timeouts = [];
    let promise;
    if (!timeout) {
        promise = promise_internal;
    }
    else {
        promise = new Proxy(promise_internal, {
            get(target, prop) {
                if (prop === 'then' && !finished) {
                    const err = new Error(`Promise hasn't resolved after ${humanizeTime(timeout)}`);
                    timeouts.push(setTimeout(() => {
                        assert(err.stack);
                        assertWarning(false, removeStackErrorPrefix(err.stack), { onlyOnce: false });
                    }, timeout));
                }
                const value = Reflect.get(target, prop);
                return typeof value === 'function' ? value.bind(target) : value;
            },
        });
    }
    return { promise, resolve, reject };
}
function removeStackErrorPrefix(errStack) {
    const errorPrefix = 'Error: ';
    if (errStack.startsWith(errorPrefix))
        errStack = errStack.slice(errorPrefix.length);
    return errStack;
}
