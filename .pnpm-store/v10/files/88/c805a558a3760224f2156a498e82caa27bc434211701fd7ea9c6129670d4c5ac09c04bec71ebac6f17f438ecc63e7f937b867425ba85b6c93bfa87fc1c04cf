export { addPathToReplacer };
/**
 * The `replacer()` callback of `JSON.stringify()` doesn't provide the path of the object property that is being stringified.
 *
 * `addPathToReplacer(replacer)` adds the property path to the `replacer()` callback as last parameter.
 */
function addPathToReplacer(replacer) {
    const pathMap = new WeakMap();
    return replacerForJsonStringify;
    function replacerForJsonStringify(key, valueAfterNativeJsonStringify) {
        const pathPrevious = pathMap.get(this) ?? [];
        const path = [...pathPrevious];
        if (key !== '') {
            const pathEntry = !Array.isArray(this) ? key : parseInt(key, 10);
            path.push(pathEntry);
        }
        if (isIterable(valueAfterNativeJsonStringify))
            pathMap.set(valueAfterNativeJsonStringify, path);
        return replacer.call(this, key, valueAfterNativeJsonStringify, path);
    }
}
function isIterable(value) {
    return value === Object(value);
}
