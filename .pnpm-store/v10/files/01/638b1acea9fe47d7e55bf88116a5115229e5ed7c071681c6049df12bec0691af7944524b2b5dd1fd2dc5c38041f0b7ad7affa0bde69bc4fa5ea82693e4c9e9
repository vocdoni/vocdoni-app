export { isDebug };
export { logDebug };
import { logLabel } from './utils.js';
// We purposely read process.env.DEBUG early, in order to avoid users from the temptation to set process.env.DEBUG with JavaScript, since reading & writing process.env.DEBUG dynamically leads to inconsistencies such as https://github.com/vikejs/vike/issues/2239
const DEBUG = getDEBUG() ?? '';
const isDebug = DEBUG.includes('vite-plugin-server-entry');
if (isDebug)
    Error.stackTraceLimit = Infinity;
function logDebug(...msgs) {
    console.log(`${logLabel}[DEBUG]`, ...msgs);
}
function getDEBUG() {
    let DEBUG;
    // - `process` can be undefined in edge workers
    // - We want bundlers to be able to statically replace `process.env.*`
    try {
        DEBUG = process.env.DEBUG;
    }
    catch { }
    return DEBUG;
}
