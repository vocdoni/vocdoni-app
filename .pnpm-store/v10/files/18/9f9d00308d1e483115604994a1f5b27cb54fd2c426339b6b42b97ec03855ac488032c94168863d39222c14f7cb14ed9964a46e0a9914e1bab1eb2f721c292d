export { getCwdSafe };
import { toPosixPath } from './filesystemPathHandling.js';
// Notes:
// - Cloudflare Workers implements a dummy `process.cwd()` that always returns `process.cwd() === '/'`
function getCwdSafe() {
    if (typeof process == 'undefined' || !('cwd' in process))
        return null;
    return toPosixPath(process.cwd());
}
