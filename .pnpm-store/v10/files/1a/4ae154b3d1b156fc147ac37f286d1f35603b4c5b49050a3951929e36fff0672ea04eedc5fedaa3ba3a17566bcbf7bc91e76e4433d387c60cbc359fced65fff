export { extractAssetsAddQuery };
export { extractAssetsRemoveQuery };
// We import from node/utils.ts instead of node/vite/utils.ts because this file is loaded by the server runtime
import { assert } from '../utils/assert.js';
import { getFileExtension } from '../utils/getFileExtension.js';
const query = 'extractAssets';
function extractAssetsAddQuery(id) {
    const fileExtension = getFileExtension(id);
    if (!fileExtension || id.includes('virtual:vike:')) {
        return `${id}?${query}`;
    }
    else {
        if (!id.includes('?')) {
            return `${id}?${query}&lang.${fileExtension}`;
        }
        else {
            return id.replace('?', `?${query}&`);
        }
    }
}
function extractAssetsRemoveQuery(id) {
    if (!id.includes('?'))
        return id;
    const suffix = `?${query}`;
    // Only supports 'virtual:vike:' IDs
    assert(id.endsWith(query));
    return id.slice(0, -1 * suffix.length);
}
