export { isAbsolutePath };
import path from 'path';
import { assertPosixPath } from './filesystemPathHandling.js';
// Workaround for:
// ```
// const p = 'E:/Projects/vite-ssr-test/dist/server'
// assertPosixPath(p)
// assert(path.posix.isAbsolute(p)===false)
// assert(path.win32.isAbsolute(p)===true)
// ```
function isAbsolutePath(p) {
    assertPosixPath(p);
    if (process.platform === 'win32') {
        return path.win32.isAbsolute(p);
    }
    else {
        return path.posix.isAbsolute(p);
    }
}
