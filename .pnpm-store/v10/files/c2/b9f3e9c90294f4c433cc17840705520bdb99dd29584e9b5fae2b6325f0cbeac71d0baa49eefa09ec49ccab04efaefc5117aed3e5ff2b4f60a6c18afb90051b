export { parse };
// Used by Vike: https://github.com/vikejs/vike/blob/b4ba6b70e6bdc2e1f460c0d2e4c3faae5d0a733c/vike/shared/page-configs/serialize/parseConfigValuesSerialized.ts#L13
export { parseTransform };
import { types } from './types.js';
function parse(str, options = {}) {
    // We don't use the reviver option in `JSON.parse(str, reviver)` because it doesn't support `undefined` values
    const value = JSON.parse(str);
    return parseTransform(value, options);
}
function parseTransform(value, options = {}) {
    if (typeof value === 'string') {
        return reviver(value, options);
    }
    if (
    // Also matches arrays
    typeof value === 'object' &&
        value !== null) {
        Object.entries(value).forEach(([key, val]) => {
            ;
            value[key] = parseTransform(val, options);
        });
    }
    return value;
}
function reviver(value, options) {
    const parser = (str) => parse(str, options);
    {
        const res = options.reviver?.(
        // TO-DO/eventually: provide key if some user needs it
        undefined, value, parser);
        if (res) {
            if (typeof res.replacement !== 'string') {
                return res.replacement;
            }
            else {
                value = res.replacement;
                if (res.resolved)
                    return value;
            }
        }
    }
    for (const { match, deserialize } of types) {
        if (match(value)) {
            return deserialize(value, parser);
        }
    }
    return value;
}
