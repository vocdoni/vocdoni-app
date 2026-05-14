"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNonce = getNonce;
exports.getNonceKeyCount = getNonceKeyCount;
exports.watchNonceIncremented = watchNonceIncremented;
exports.watchActiveKeyCountChanged = watchActiveKeyCountChanged;
const readContract_js_1 = require("../../actions/public/readContract.js");
const watchContractEvent_js_1 = require("../../actions/public/watchContractEvent.js");
const Abis = require("../Abis.js");
const Addresses = require("../Addresses.js");
const utils_js_1 = require("../internal/utils.js");
async function getNonce(client, parameters) {
    const { account, nonceKey, ...rest } = parameters;
    return (0, readContract_js_1.readContract)(client, {
        ...rest,
        ...getNonce.call({ account, nonceKey }),
    });
}
(function (getNonce) {
    function call(args) {
        const { account, nonceKey } = args;
        return (0, utils_js_1.defineCall)({
            address: Addresses.nonceManager,
            abi: Abis.nonce,
            args: [account, nonceKey],
            functionName: 'getNonce',
        });
    }
    getNonce.call = call;
})(getNonce || (exports.getNonce = getNonce = {}));
async function getNonceKeyCount(client, parameters) {
    const { account, ...rest } = parameters;
    return (0, readContract_js_1.readContract)(client, {
        ...rest,
        ...getNonceKeyCount.call({ account }),
    });
}
(function (getNonceKeyCount) {
    function call(args) {
        const { account } = args;
        return (0, utils_js_1.defineCall)({
            address: Addresses.nonceManager,
            abi: Abis.nonce,
            args: [account],
            functionName: 'getActiveNonceKeyCount',
        });
    }
    getNonceKeyCount.call = call;
})(getNonceKeyCount || (exports.getNonceKeyCount = getNonceKeyCount = {}));
function watchNonceIncremented(client, parameters) {
    const { onNonceIncremented, ...rest } = parameters;
    return (0, watchContractEvent_js_1.watchContractEvent)(client, {
        ...rest,
        address: Addresses.nonceManager,
        abi: Abis.nonce,
        eventName: 'NonceIncremented',
        onLogs: (logs) => {
            for (const log of logs)
                onNonceIncremented(log.args, log);
        },
        strict: true,
    });
}
function watchActiveKeyCountChanged(client, parameters) {
    const { onActiveKeyCountChanged, ...rest } = parameters;
    return (0, watchContractEvent_js_1.watchContractEvent)(client, {
        ...rest,
        address: Addresses.nonceManager,
        abi: Abis.nonce,
        eventName: 'ActiveKeyCountChanged',
        onLogs: (logs) => {
            for (const log of logs)
                onActiveKeyCountChanged(log.args, log);
        },
        strict: true,
    });
}
//# sourceMappingURL=nonce.js.map