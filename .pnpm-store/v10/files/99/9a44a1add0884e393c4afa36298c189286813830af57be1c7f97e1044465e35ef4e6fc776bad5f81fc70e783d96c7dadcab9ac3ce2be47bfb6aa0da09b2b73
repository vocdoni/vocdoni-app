export { isVikeCliOrApi };
export { setContextVikeApiOperation };
export { clearContextVikeApiOperation };
export { getVikeApiOperation };
// We don't import ./utils.js because this file is imported by server/
import { assert } from '../utils/assert.js';
import { getGlobalObject } from '../utils/getGlobalObject.js';
const globalObject = getGlobalObject('api/context.ts', {});
function getVikeApiOperation() {
    return globalObject.vikeApiOperation ?? null;
}
function isVikeCliOrApi() {
    // The CLI uses the API
    return !!globalObject.vikeApiOperation;
}
function setContextVikeApiOperation(operation, options) {
    assert(!globalObject.vikeApiOperation);
    globalObject.vikeApiOperation = { operation, options };
}
function clearContextVikeApiOperation() {
    globalObject.vikeApiOperation = undefined;
}
