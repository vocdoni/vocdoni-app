export { rollupSourceMapRemove };
export { rollupSourceMapPassthrough };
// https://rollupjs.org/guide/en/#source-code-transformations
/** Remove entire source mapping, to save KBs. */
function rollupSourceMapRemove(code) {
    return {
        code,
        map: { mappings: '' },
    };
}
/** Don't provide any source map, pass through current source map instead. */
function rollupSourceMapPassthrough(code) {
    return {
        code,
        map: null,
    };
}
