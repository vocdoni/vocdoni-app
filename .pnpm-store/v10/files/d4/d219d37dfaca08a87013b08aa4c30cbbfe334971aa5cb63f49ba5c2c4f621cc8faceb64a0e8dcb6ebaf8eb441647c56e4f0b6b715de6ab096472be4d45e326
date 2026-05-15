export { modifyUrl };
import { modifyUrlSameOrigin } from './modifyUrlSameOrigin.js';
import { parseUrl, createUrlFromComponents } from '../utils/parseUrl.js';
/**
 * Modify a URL.
 *
 * Example: changing the URL pathname for internationalization.
 *
 * https://vike.dev/modifyUrl
 */
function modifyUrl(url, modify) {
    url = modifyUrlSameOrigin(url, modify);
    const urlParsed = parseUrl(url, '/');
    // Origin
    const originParts = [
        modify.protocol ?? urlParsed.protocol ?? '',
        modify.hostname ?? urlParsed.hostname ?? '',
    ];
    const port = modify.port ?? urlParsed.port;
    if (port || port === 0) {
        originParts.push(`:${port}`);
    }
    const origin = originParts.join('');
    const urlModified = createUrlFromComponents(origin, urlParsed.pathname, urlParsed.searchOriginal, urlParsed.hashOriginal);
    return urlModified;
}
