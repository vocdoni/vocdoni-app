export { getViteRPC }; // consumer (aka RPC client)
export { createViteRPC }; // provider (aka RPC server)
import { assert } from './assert.js';
import { genPromise } from './genPromise.js';
import { getRandomId } from './getRandomId.js';
import { getGlobalObject } from './getGlobalObject.js';
import { createDebug } from './debug.js';
import { assertIsNotBrowser } from './assertIsNotBrowser.js';
assertIsNotBrowser();
const globalObject = getGlobalObject('utils/getViteRPC.ts', {
    rpc: null,
});
const debug = createDebug('vike:vite-rpc');
function getViteRPC() {
    globalObject.rpc ?? (globalObject.rpc = createRpcClient());
    return globalObject.rpc;
}
function createRpcClient() {
    const hot = import.meta.hot;
    assert(hot);
    const listeners = [];
    hot.on(`vike:rpc:response`, (dataResponse) => {
        if (debug.isActivated)
            debug('Response received', dataResponse);
        const { callId, functionReturn } = dataResponse;
        listeners.forEach((l) => {
            if (callId !== l.callId)
                return;
            l.cb(functionReturn);
            listeners.splice(listeners.indexOf(l), 1);
        });
    });
    const rpc = new Proxy({}, {
        get(_, functionName) {
            return async (...functionArgs) => {
                const hot = import.meta.hot;
                assert(hot);
                const callId = getRandomId();
                const { promise, resolve } = genPromise({ timeout: 3 * 1000 });
                listeners.push({
                    callId,
                    cb: (functionReturn) => {
                        resolve(functionReturn);
                    },
                });
                const dataRequest = { callId, functionName, functionArgs };
                if (debug.isActivated)
                    debug('Request sent', dataRequest);
                // Vite's type is wrong: import.meta.hot.send() does seem to return a promise
                await hot.send('vike:rpc:request', dataRequest);
                const functionReturn = await promise;
                return functionReturn;
            };
        },
    });
    return rpc;
}
function createViteRPC(viteDevServer, getRpcFunctions) {
    const rpcFunctions = getRpcFunctions(viteDevServer);
    const { environments } = viteDevServer;
    for (const envName in environments) {
        debug('Listening to environment', envName);
        const env = environments[envName];
        env.hot.on('vike:rpc:request', async (dataRequest) => {
            if (debug.isActivated)
                debug('Request received', dataRequest);
            const { callId, functionName, functionArgs } = dataRequest;
            const functionReturn = await rpcFunctions[functionName](...functionArgs);
            const dataResponse = { callId, functionReturn };
            if (debug.isActivated)
                debug('Response sent', dataResponse);
            env.hot.send('vike:rpc:response', dataResponse);
        });
    }
}
