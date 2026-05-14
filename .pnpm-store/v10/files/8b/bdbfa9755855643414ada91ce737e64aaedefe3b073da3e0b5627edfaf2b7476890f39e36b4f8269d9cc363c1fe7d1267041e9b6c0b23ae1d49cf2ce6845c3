export { createDebugger };
export { isDebugEnabled };
import { isBrowser } from './isBrowser.js';
import { isCallable } from './isCallable.js';
import { objectAssign } from './objectAssign.js';
import { assert } from './assert.js';
assert(!isBrowser(), 'utils/debug.js loaded in browser');
function createDebugger(namespace, optionsGlobal) {
    const debugWithOptions = (options) => {
        return (msg, info) => {
            if (!isDebugEnabled(namespace))
                return;
            if (info !== undefined) {
                msg += strInfo(info, { ...optionsGlobal, ...options });
            }
            console.log('\x1b[1m%s\x1b[0m', namespace, msg);
        };
    };
    const debug = (msg, info) => debugWithOptions({})(msg, info);
    objectAssign(debug, { options: debugWithOptions, isEnabled: isDebugEnabled(namespace) });
    return debug;
}
function isDebugEnabled(namespace) {
    let DEBUG;
    // - `process` can be undefined in edge workers
    // - We want bundlers to be able to statically replace `process.env.*`
    try {
        DEBUG = process.env.DEBUG;
    }
    catch { }
    return DEBUG?.includes(namespace) ?? false;
}
function strInfo(info, options) {
    if (info === undefined) {
        return undefined;
    }
    let str = '\n';
    if (typeof info === 'string') {
        str += info;
    }
    else if (Array.isArray(info)) {
        if (info.length === 0) {
            str += options.serialization?.emptyArray ?? '[]';
        }
        else {
            str += info.map(strUnknown).join('\n');
        }
    }
    else {
        str += strUnknown(info);
    }
    str = pad(str);
    return str;
}
function pad(str) {
    const PADDING = '     ';
    const terminalWidth = getTerminalWidth();
    const lines = [];
    str.split('\n').forEach((line) => {
        if (!terminalWidth) {
            lines.push(line);
        }
        else {
            chunk(line, terminalWidth - PADDING.length).forEach((chunk) => {
                lines.push(chunk);
            });
        }
    });
    return lines.join('\n' + PADDING);
}
function chunk(str, size) {
    if (str.length <= size) {
        return [str];
    }
    const chunks = str.match(new RegExp('.{1,' + size + '}', 'g'));
    assert(chunks);
    return chunks;
}
function strUnknown(thing) {
    return typeof thing === 'string' ? thing : strObj(thing);
}
function strObj(obj, newLines = false) {
    return JSON.stringify(obj, replaceFunctionSerializer, newLines ? 2 : undefined);
}
function replaceFunctionSerializer(_key, value) {
    if (isCallable(value)) {
        return value.toString().split(/\s+/).join(' ');
    }
    return value;
}
function getTerminalWidth() {
    // https://stackoverflow.com/questions/30335637/get-width-of-terminal-in-node-js/30335724#30335724
    return ((typeof process !== 'undefined' && typeof process.stdout !== 'undefined' && process.stdout.columns) || undefined);
}
