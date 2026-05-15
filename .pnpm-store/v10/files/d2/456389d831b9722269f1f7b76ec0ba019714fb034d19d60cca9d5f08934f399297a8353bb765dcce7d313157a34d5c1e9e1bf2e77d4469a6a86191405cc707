export { isWebpackResolve };
import { assert } from './assert.js';
import { toPosixPath } from './filesystemPathHandling.js';
function isWebpackResolve(moduleResolve, cwd) {
    assert(process); // We are in a Node.js-like environment
    return (
    // Upon `require.resolve()` webpack returns a number
    typeof moduleResolve === 'number' ||
        // Upon `import.meta.resolve()` webpack returns a path such as /test/webpack/dist/server/entry.mjs which seems to be relative to the monorepo root
        getFirstDir(moduleResolve) !== getFirstDir(cwd) ||
        // `import.meta.resolve()` + windows => webpack returns file:///D:/test/webpack/dist/server/entry.mjs
        (process.platform === 'win32' && getSecondDir(moduleResolve) !== getSecondDir(cwd)));
}
function getFirstDir(path) {
    return getDirs(path)[0];
}
function getSecondDir(path) {
    return getDirs(path)[1];
}
function getDirs(path) {
    assert(!path.startsWith('file:')); // `file://` should already have been removed
    return toPosixPath(path).split('/').filter(Boolean);
}
