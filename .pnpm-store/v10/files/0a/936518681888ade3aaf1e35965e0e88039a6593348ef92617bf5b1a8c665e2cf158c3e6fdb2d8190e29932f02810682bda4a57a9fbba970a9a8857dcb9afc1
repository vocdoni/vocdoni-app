export { toPosixPath };
export { assertPosixPath };
export { toSystemPath };
import { assert } from './assert.js';
const sepPosix = '/';
const sepWin32 = '\\';
function toPosixPath(path) {
    if (isPosix()) {
        assertPosixPath(path);
        return path;
    }
    if (isWin32()) {
        const pathPosix = path.split(sepWin32).join(sepPosix);
        assertPosixPath(pathPosix);
        return pathPosix;
    }
    assert(false);
}
function assertPosixPath(path) {
    assert(path && !path.includes(sepWin32), `Wrongly formatted path: ${path}`);
}
function toSystemPath(path) {
    if (isPosix()) {
        return toPosixPath(path);
    }
    if (isWin32()) {
        return path.split(sepPosix).join(sepWin32);
    }
    assert(false);
}
function isWin32() {
    return process.platform === 'win32';
}
function isPosix() {
    return !isWin32();
}
