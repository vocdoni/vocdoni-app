export { navigate };
export { reload };
export { prefetch };
export { onPopState };
import { assertWarning } from '../../utils/assert.js';
import '../assertEnvServer.js';
// `never` to ensure package.json#exports["./client/router"].types points to type defined by the client-side code
const navigate = (() => warnNoEffect('navigate'));
const reload = (() => warnNoEffect('reload'));
const prefetch = (() => warnNoEffect('prefetch'));
const onPopState = (() => { });
function warnNoEffect(caller) {
    assertWarning(false, `Calling ${caller}() on the server-side has no effect`, {
        showStackTrace: true,
        onlyOnce: false,
    });
}
