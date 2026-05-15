import { readContract } from '../../actions/public/readContract.js';
import { watchContractEvent } from '../../actions/public/watchContractEvent.js';
import { writeContract } from '../../actions/wallet/writeContract.js';
import { writeContractSync } from '../../actions/wallet/writeContractSync.js';
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js';
import * as Abis from '../Abis.js';
import { defineCall } from '../internal/utils.js';
/**
 * Claims accumulated rewards for a recipient.
 *
 * This function allows a reward recipient to claim their accumulated rewards
 * and receive them as token transfers to their own balance.
 *
 * - Accrues all pending rewards up to the current block timestamp.
 * - Updates the caller's reward accounting.
 * - Transfers the caller's accumulated `rewardBalance` from the token contract to the caller.
 * - If the contract's balance is insufficient, claims up to the available amount.
 * - Returns the actual amount claimed.
 *
 * Notes:
 * - Reverts with `Paused` if the token is paused.
 * - Reverts with `PolicyForbids` if the caller is not authorized to receive tokens under TIP-403.
 * - If opted in, the claimed amount is added back to `optedInSupply` since it goes to the recipient's balance.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.reward.claim(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function claim(client, parameters) {
    return claim.inner(writeContract, client, parameters);
}
(function (claim) {
    /** @internal */
    async function inner(action, client, parameters) {
        const { token, ...rest } = parameters;
        const call = claim.call({ token });
        return (await action(client, {
            ...rest,
            ...call,
        }));
    }
    claim.inner = inner;
    /**
     * Defines a call to the `claimRewards` function.
     *
     * Can be passed as a parameter to:
     * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
     * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
     * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
     *
     * @example
     * ```ts
     * import { createClient, http, walletActions } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { Actions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(walletActions)
     *
     * const hash = await client.sendTransaction({
     *   calls: [actions.reward.claim.call({
     *     token: '0x20c0000000000000000000000000000000000001',
     *   })],
     * })
     * ```
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { token } = args;
        return defineCall({
            address: token,
            abi: Abis.tip20,
            args: [],
            functionName: 'claimRewards',
        });
    }
    claim.call = call;
})(claim || (claim = {}));
/**
 * Claims accumulated rewards for a recipient and waits for confirmation.
 *
 * This function allows a reward recipient to claim their accumulated rewards
 * and receive them as token transfers to their own balance.
 *
 * Behavior:
 * - Accrues all pending rewards up to the current block timestamp.
 * - Updates the caller's reward accounting.
 * - Transfers the caller's accumulated `rewardBalance` from the token contract to the caller.
 * - If the contract's balance is insufficient, claims up to the available amount.
 *
 * Notes:
 * - Reverts with `Paused` if the token is paused.
 * - Reverts with `PolicyForbids` if the caller is not authorized to receive tokens under TIP-403.
 * - If opted in, the claimed amount is added back to `optedInSupply` since it goes to the recipient's balance.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const { receipt } = await Actions.reward.claimSync(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The amount claimed and transaction receipt.
 */
export async function claimSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await claim.inner(writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    return {
        receipt,
    };
}
/**
 * Gets the total reward per second rate for all active streams.
 *
 * Returns the current aggregate per-second emission rate scaled by `ACC_PRECISION` (1e18).
 * This value represents the sum of all active reward streams' emission rates.
 * The rate decreases when streams end (via `finalizeStreams`) or are canceled.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const rate = await Actions.rewards.getTotalPerSecond(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The total reward per second (scaled by 1e18).
 */
export async function getTotalPerSecond(client, parameters) {
    return readContract(client, {
        ...parameters,
        ...getTotalPerSecond.call(parameters),
    });
}
(function (getTotalPerSecond) {
    /**
     * Defines a call to the `totalRewardPerSecond` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { token } = args;
        return defineCall({
            address: token,
            abi: Abis.tip20,
            args: [],
            functionName: 'totalRewardPerSecond',
        });
    }
    getTotalPerSecond.call = call;
})(getTotalPerSecond || (getTotalPerSecond = {}));
/**
 * Gets the reward information for a specific account.
 *
 * Returns the reward recipient address, reward per token value, and accumulated reward balance for the specified account.
 * This information includes:
 * - `rewardRecipient`: The address designated to receive rewards (zero address if opted out)
 * - `rewardPerToken`: The reward per token value for this account
 * - `rewardBalance`: The accumulated reward balance waiting to be claimed
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const info = await Actions.reward.getUserRewardInfo(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 *   account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The user's reward information (recipient, rewardPerToken, rewardBalance).
 */
export async function getUserRewardInfo(client, parameters) {
    return readContract(client, {
        ...parameters,
        ...getUserRewardInfo.call(parameters),
    });
}
(function (getUserRewardInfo) {
    /**
     * Defines a call to the `userRewardInfo` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { account, token } = args;
        return defineCall({
            address: token,
            abi: Abis.tip20,
            args: [account],
            functionName: 'userRewardInfo',
        });
    }
    getUserRewardInfo.call = call;
})(getUserRewardInfo || (getUserRewardInfo = {}));
/**
 * Sets or changes the reward recipient for a token holder.
 *
 * This function allows a token holder to designate who should receive their share of rewards:
 * - If `recipient` is the zero address, opts out from rewards distribution.
 * - Otherwise, opts in and sets `recipient` as the address that will receive accrued rewards.
 * - Can be called with `recipient == msg.sender` to receive rewards directly.
 * - Automatically distributes any accrued rewards to the current recipient before changing.
 *
 * TIP-403 Policy:
 * - Reverts with `PolicyForbids` if `recipient` is not the zero address and either the holder or recipient is not authorized to receive tokens under the token's transfer policy.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.rewards.setRecipient(client, {
 *   recipient: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function setRecipient(client, parameters) {
    return setRecipient.inner(writeContract, client, parameters);
}
/**
 * Sets or changes the reward recipient for a token holder and waits for confirmation.
 *
 * This function allows a token holder to designate who should receive their share of rewards:
 * - If `recipient` is the zero address, opts out from rewards distribution.
 * - Otherwise, opts in and sets `recipient` as the address that will receive accrued rewards.
 * - Can be called with `recipient == msg.sender` to receive rewards directly.
 * - Automatically distributes any accrued rewards to the current recipient before changing.
 *
 * TIP-403 Policy:
 * - Reverts with `PolicyForbids` if `recipient` is not the zero address and either the holder or recipient is not authorized to receive tokens under the token's transfer policy.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const { holder, recipient, receipt } = await Actions.rewards.setRecipientSync(client, {
 *   recipient: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The holder, recipient, and transaction receipt.
 */
export async function setRecipientSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await setRecipient.inner(writeContractSync, client, {
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
    /** @internal */
    async function inner(action, client, parameters) {
        const { recipient, token, ...rest } = parameters;
        const call = setRecipient.call({ recipient, token });
        return (await action(client, {
            ...rest,
            ...call,
        }));
    }
    setRecipient.inner = inner;
    /**
     * Defines a call to the `setRecipient` function.
     *
     * Can be passed as a parameter to:
     * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
     * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
     * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
     *
     * @example
     * ```ts
     * import { createClient, http, walletActions } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { Actions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(walletActions)
     *
     * const hash = await client.sendTransaction({
     *   calls: [actions.rewards.setRecipient.call({
     *     recipient: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
     *     token: '0x20c0000000000000000000000000000000000001',
     *   })],
     * })
     * ```
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { recipient, token } = args;
        return defineCall({
            address: token,
            abi: Abis.tip20,
            args: [recipient],
            functionName: 'setRewardRecipient',
        });
    }
    setRecipient.call = call;
    /**
     * Extracts the `RewardRecipientSet` event from logs.
     *
     * @param logs - The logs.
     * @returns The `RewardRecipientSet` event.
     */
    function extractEvent(logs) {
        const [log] = parseEventLogs({
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
})(setRecipient || (setRecipient = {}));
/**
 * Starts a new reward stream that distributes tokens to opted-in holders.
 *
 * Behavior:
 * - Transfers `amount` of tokens from the caller into the token contract's reward pool.
 * - If `seconds == 0`: Immediately distributes `amount` to current opted-in holders by increasing `rewardPerTokenStored`.
 *   Returns stream ID `0`. Distribution occurs when holders interact with the token (transfers, etc.).
 * - If `seconds > 0`: Starts a linear stream that emits evenly from `block.timestamp` to `block.timestamp + seconds`.
 *   Returns a unique stream ID for later cancellation.
 *
 * Notes:
 * - Reverts with `InvalidAmount` if `amount == 0`.
 * - Allowed even when `optedInSupply == 0` (tokens distributed while no one is opted in are locked permanently).
 * - The transfer from caller to pool is subject to TIP-403 policy checks.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.rewards.start(client, {
 *   amount: 100000000000000000000n,
 *   seconds: 86400,
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function start(client, parameters) {
    return start.inner(writeContract, client, parameters);
}
/**
 * Starts a new reward stream that distributes tokens to opted-in holders and waits for confirmation.
 *
 * Behavior:
 * - Transfers `amount` of tokens from the caller into the token contract's reward pool.
 * - If `seconds == 0`: Immediately distributes `amount` to current opted-in holders by increasing `rewardPerTokenStored`.
 *   Returns stream ID `0`. Distribution occurs when holders interact with the token (transfers, etc.).
 * - If `seconds > 0`: Starts a linear stream that emits evenly from `block.timestamp` to `block.timestamp + seconds`.
 *   Returns a unique stream ID for later cancellation.
 *
 * Notes:
 * - Reverts with `InvalidAmount` if `amount == 0`.
 * - Allowed even when `optedInSupply == 0` (tokens distributed while no one is opted in are locked permanently).
 * - The transfer from caller to pool is subject to TIP-403 policy checks.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const { id, receipt } = await Actions.rewards.startSync(client, {
 *   amount: 100000000000000000000n,
 *   seconds: 86400,
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The stream ID, funder, amount, duration, and transaction receipt.
 */
export async function startSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await start.inner(writeContractSync, client, {
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
    /** @internal */
    async function inner(action, client, parameters) {
        const { amount, token, ...rest } = parameters;
        const call = start.call({ amount, token });
        return (await action(client, {
            ...rest,
            ...call,
        }));
    }
    start.inner = inner;
    /**
     * Defines a call to the `start` function.
     *
     * Can be passed as a parameter to:
     * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
     * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
     * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
     *
     * @example
     * ```ts
     * import { createClient, http, walletActions } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { Actions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(walletActions)
     *
     * const hash = await client.sendTransaction({
     *   calls: [actions.rewards.start.call({
     *     amount: 100000000000000000000n,
     *     seconds: 86400,
     *     token: '0x20c0000000000000000000000000000000000001',
     *   })],
     * })
     * ```
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { amount, token } = args;
        return defineCall({
            address: token,
            abi: Abis.tip20,
            args: [amount, 0],
            functionName: 'startReward',
        });
    }
    start.call = call;
    /**
     * Extracts the `RewardScheduled` event from logs.
     *
     * @param logs - The logs.
     * @returns The `RewardScheduled` event.
     */
    function extractEvent(logs) {
        const [log] = parseEventLogs({
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
})(start || (start = {}));
/**
 * Watches for reward scheduled events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const unwatch = Actions.reward.watchRewardScheduled(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 *   onRewardScheduled: (args, log) => {
 *     console.log('Reward scheduled:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchRewardScheduled(client, parameters) {
    const { onRewardScheduled, token, ...rest } = parameters;
    return watchContractEvent(client, {
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
/**
 * Watches for reward recipient set events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const unwatch = Actions.reward.watchRewardRecipientSet(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 *   onRewardRecipientSet: (args, log) => {
 *     console.log('Reward recipient set:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchRewardRecipientSet(client, parameters) {
    const { onRewardRecipientSet, token, ...rest } = parameters;
    return watchContractEvent(client, {
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