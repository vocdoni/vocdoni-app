export { resolveUrlPathname };
import { assertIsNotBrowser } from '../../utils/assertIsNotBrowser.js';
import { assert, assertUsage } from '../../utils/assert.js';
assertIsNotBrowser(); // Don't bloat the client
/** Given a `routeString` and `routeParams`, resolve `urlPathname`.
 *
 * Basically, the correct implementation of following:
 * ```js
 * let urlPathname = routeString
 * Object.entries(routeParams).forEach(([key, val]) => {
 *   urlPathname = urlPathname.replaceAll(key, val)
 * })
 * ```
 */
function resolveUrlPathname(routeString, routeParams) {
    let parts = [{ val: routeString, type: 'ROUTE_STRING' }];
    Object.entries(routeParams).forEach(([key, val]) => {
        if (key.startsWith('*')) {
            assert(key === '*' || /\d+/.test(key.slice(1)));
            assertUsage(key === '*', "Resolving URL with multiple globs isn't implemented yet");
        }
        else {
            key = `@${key}`;
        }
        parts = parts
            .map((part) => {
            if (part.type === 'URL') {
                return part;
            }
            else {
                return part.val
                    .split(key)
                    .map((rest, i) => {
                    const partURL = { val, type: 'URL' };
                    const partRouteString = { val: rest, type: 'ROUTE_STRING' };
                    return i === 0 ? [partRouteString] : [partURL, partRouteString];
                })
                    .flat();
            }
        })
            .flat();
    });
    const urlPathname = parts.map((p) => p.val).join('');
    return urlPathname;
}
