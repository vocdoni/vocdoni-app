"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claim = claim;
exports.claimSync = claimSync;
exports.getTotalPerSecond = getTotalPerSecond;
exports.getUserRewardInfo = getUserRewardInfo;
exports.setRecipient = setRecipient;
exports.setRecipientSync = setRecipientSync;
exports.start = start;
exports.startSync = startSync;
exports.watchRewardScheduled = watchRewardScheduled;
exports.watchRewardRecipientSet = watchRewardRecipientSet;
const readContract_js_1 = require("../../actions/public/readContract.js");
const watchContractEvent_js_1 = require("../../actions/public/watchContractEvent.js");
const writeContract_js_1 = require("../../actions/wallet/writeContract.js");
const writeContractSync_js_1 = require("../../actions/wallet/writeContractSync.js");
const parseEventLogs_js_1 = require("../../utils/abi/parseEventLogs.js");
const Abis = require("../Abis.js");
const utils_js_1 = require("../internal/utils.js");
async function claim(client, parameters) {
    return claim.inner(writeContract_js_1.writeContract, client, parameters);
}
(function (claim) {
    async function inner(action, client, parameters) {
        const { token, ...rest } = parameters;
        const call = claim.call({ token });
        return (await action(client, {
            ...rest,
            ...call,
        }));
    }
    claim.inner = inner;
    function call(args) {
        const { token } = args;
        return (0, utils_js_1.defineCall)({
            address: token,
            abi: Abis.tip20,
            args: [],
            functionName: 'claimRewards',
        });
    }
    claim.call = call;
})(claim || (exports.claim = claim = {}));
async function claimSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await claim.inner(writeContractSync_js_1.writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    return {
        receipt,
    };
}
async function getTotalPerSecond(client, parameters) {
    return (0, readContract_js_1.readContract)(client, {
        ...parameters,
        ...getTotalPerSecond.call(parameters),
    });
}
(function (getTotalPerSecond) {
    function call(args) {
        const { token } = args;
        return (0, utils_js_1.defineCall)({
            address: token,
            abi: Abis.tip20,
            args: [],
            functionName: 'totalRewardPerSecond',
        });
    }
    getTotalPerSecond.call = call;
})(getTotalPerSecond || (exports.getTotalPerSecond = getTotalPerSecond = {}));
async function getUserRewardInfo(client, parameters) {
    return (0, readContract_js_1.readContract)(client, {
        ...parameters,
        ...getUserRewardInfo.call(parameters),
    });
}
(function (getUserRewardInfo) {
    function call(args) {
        const { account, token } = args;
        return (0, utils_js_1.defineCall)({
            address: token,
            abi: Abis.tip20,
            args: [account],
            functionName: 'userRewardInfo',
        });
    }
    getUserRewardInfo.call = call;
})(getUserRewardInfo || (exports.getUserRewardInfo = getUserRewardInfo = {}));
async function setRecipient(client, parameters) {
    return setRecipient.inner(writeContract_js_1.writeContract, client, parameters);
}
async function setRecipientSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await setRecipient.inner(writeContractSync_js_1.writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = setRecipient.extractEvent(receipt.logs);
    return {
        ...args,
        receipt,
    };
}
(function (setRecipient) {
    async function inner(action, client, parameters) {
        const { recipient, token, ...rest } = parameters;
        const call = setRecipient.call({ recipient, token });
        return (await action(client, {
            ...rest,
            ...call,
        }));
    }
    setRecipient.inner = inner;
    function call(args) {
        const { recipient, token } = args;
        return (0, utils_js_1.defineCall)({
            address: token,
            abi: Abis.tip20,
            args: [recipient],
            functionName: 'setRewardRecipient',
        });
    }
    setRecipient.call = call;
    function extractEvent(logs) {
        const [log] = (0, parseEventLogs_js_1.parseEventLogs)({
            abi: Abis.tip20,
            logs,
            eventName: 'RewardRecipientSet',
            strict: true,
        });
        if (!log)
            throw new Error('`RewardRecipientSet` event not found.');
        return log;
    }
    setRecipient.extractEvent = extractEvent;
})(setRecipient || (exports.setRecipient = setRecipient = {}));
async function start(client, parameters) {
    return start.inner(writeContract_js_1.writeContract, client, parameters);
}
async function startSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await start.inner(writeContractSync_js_1.writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = start.extractEvent(receipt.logs);
    return {
        ...args,
        receipt,
    };
}
(function (start) {
    async function inner(action, client, parameters) {
        const { amount, token, ...rest } = parameters;
        const call = start.call({ amount, token });
        return (await action(client, {
            ...rest,
            ...call,
        }));
    }
    start.inner = inner;
    function call(args) {
        const { amount, token } = args;
        return (0, utils_js_1.defineCall)({
            address: token,
            abi: Abis.tip20,
            args: [amount, 0],
            functionName: 'startReward',
        });
    }
    start.call = call;
    function extractEvent(logs) {
        const [log] = (0, parseEventLogs_js_1.parseEventLogs)({
            abi: Abis.tip20,
            logs,
            eventName: 'RewardScheduled',
            strict: true,
        });
        if (!log)
            throw new Error('`RewardScheduled` event not found.');
        return log;
    }
    start.extractEvent = extractEvent;
})(start || (exports.start = start = {}));
function watchRewardScheduled(client, parameters) {
    const { onRewardScheduled, token, ...rest } = parameters;
    return (0, watchContractEvent_js_1.watchContractEvent)(client, {
        ...rest,
        address: token,
        abi: Abis.tip20,
        eventName: 'RewardScheduled',
        onLogs: (logs) => {
            for (const log of logs)
                onRewardScheduled(log.args, log);
        },
        strict: true,
    });
}
function watchRewardRecipientSet(client, parameters) {
    const { onRewardRecipientSet, token, ...rest } = parameters;
    return (0, watchContractEvent_js_1.watchContractEvent)(client, {
        ...rest,
        address: token,
        abi: Abis.tip20,
        eventName: 'RewardRecipientSet',
        onLogs: (logs) => {
            for (const log of logs)
                onRewardRecipientSet(log.args, log);
        },
        strict: true,
    });
}
//# sourceMappingURL=reward.js.map