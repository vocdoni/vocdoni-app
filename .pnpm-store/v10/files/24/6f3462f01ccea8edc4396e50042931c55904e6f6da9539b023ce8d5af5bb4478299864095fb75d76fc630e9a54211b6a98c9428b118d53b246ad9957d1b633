export { isScriptFile };
export { isPlainScriptFile };
export { isPlainJavaScriptFile };
export { isTemplateFile };
export { scriptFileExtensionList };
export { scriptFileExtensionPattern };
// We can't use a RegExp:
//  - Needs to work with Micromatch: https://github.com/micromatch/micromatch because:
//    - Vite's `import.meta.glob()` uses Micromatch
//  - We need this to be a allowlist because:
//   - A pattern `*([a-zA-Z0-9]` doesn't work.
//     - Because of ReScript: `.res` are ReScript source files which need to be ignored. (The ReScript compiler generates `.js` files alongside `.res` files.)
//   - Block listing doesn't work.
//     - We cannot implement a blocklist with a glob pattern.
//     - A post `import.meta.glob()` blocklist filtering doesn't work because Vite would still process the files (e.g. including them in the bundle).
// prettier-ignore
// biome-ignore format:
const extJs = [
    'js',
    'cjs',
    'mjs',
];
// prettier-ignore
// biome-ignore format:
const extTs = [
    'ts',
    'cts',
    'mts',
];
const extJsOrTs = [...extJs, ...extTs];
// prettier-ignore
// biome-ignore format:
const extJsx = [
    'jsx',
    'cjsx',
    'mjsx',
];
// prettier-ignore
// biome-ignore format:
const extTsx = [
    'tsx',
    'ctsx',
    'mtsx'
];
const extJsxOrTsx = [...extJsx, ...extTsx];
// prettier-ignore
// biome-ignore format:
const extTemplates = [
    'vue',
    'svelte',
    'marko',
    'md',
    'mdx'
];
const scriptFileExtensionList = [...extJsOrTs, ...extJsxOrTsx, ...extTemplates];
const scriptFileExtensionPattern = '{' + scriptFileExtensionList.join(',') + '}';
function isScriptFile(filePath) {
    return scriptFileExtensionList.some((ext) => filePath.endsWith('.' + ext));
}
function isPlainScriptFile(filePath) {
    return extJsOrTs.some((ext) => filePath.endsWith('.' + ext));
}
function isPlainJavaScriptFile(filePath) {
    return extJs.some((ext) => filePath.endsWith('.' + ext));
}
function isTemplateFile(filePath) {
    return extTemplates.some((ext) => filePath.endsWith('.' + ext));
}
