export { rollupIsEsm };
import { assert } from '../../../utils/assert.js';
import '../assertEnvVite.js';
function rollupIsEsm(rollupOptions) {
    const { format } = rollupOptions;
    assert(typeof format === 'string');
    assert(format === 'amd' ||
        format === 'cjs' ||
        format === 'es' ||
        format === 'iife' ||
        format === 'system' ||
        format === 'umd');
    return format === 'es';
}
