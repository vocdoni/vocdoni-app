import { readContract } from '../../actions/public/readContract.js';
import { watchContractEvent } from '../../actions/public/watchContractEvent.js';
import * as Abis from '../Abis.js';
import * as Addresses from '../Addresses.js';
import { defineCall } from '../internal/utils.js';
/**
 * Gets the nonce for an account and nonce key.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const nonce = await Actions.nonce.getNonce(client, {
 *   account: '0x...',
 *   nonceKey: 1n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The nonce value.
 */
export async function getNonce(client, parameters) {
    const { account, nonceKey, ...rest } = parameters;
    return readContract(client, {
        ...rest,
        ...getNonce.call({ account, nonceKey }),
    });
}
(function (getNonce) {
    /**
     * Defines a call to the `getNonce` function.
     *
     * Can be passed as a parameter to:
     * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
     * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
     * - [`multicall`](https://viem.sh/docs/contract/multicall): execute multiple calls in parallel
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { Actions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
     *   transport: http(),
     * })
     *
     * const result = await client.multicall({
     *   contracts: [
     *     Actions.nonce.getNonce.call({ account: '0x...', nonceKey: 1n }),
     *     Actions.nonce.getNonce.call({ account: '0x...', nonceKey: 2n }),
     *   ],
     * })
     * ```
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { account, nonceKey } = args;
        return defineCall({
            address: Addresses.nonceManager,
            abi: Abis.nonce,
            args: [account, nonceKey],
            functionName: 'getNonce',
        });
    }
    getNonce.call = call;
})(getNonce || (getNonce = {}));
/**
 * @deprecated This function has been deprecated post-AllegroModerato. It will be removed in a future version.
 */
export async function getNonceKeyCount(client, parameters) {
    const { account, ...rest } = parameters;
    return readContract(client, {
        ...rest,
        ...getNonceKeyCount.call({ account }),
    });
}
(function (getNonceKeyCount) {
    /**
     * Defines a call to the `getNonceKeyCount` function.
     *
     * Can be passed as a parameter to:
     * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
     * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
     * - [`multicall`](https://viem.sh/docs/contract/multicall): execute multiple calls in parallel
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { Actions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
     *   transport: http(),
     * })
     *
     * const result = await client.multicall({
     *   contracts: [
     *     Actions.nonce.getNonceKeyCount.call({ account: '0x...' }),
     *     Actions.nonce.getNonceKeyCount.call({ account: '0x...' }),
     *   ],
     * })
     * ```
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { account } = args;
        return defineCall({
            address: Addresses.nonceManager,
            abi: Abis.nonce,
            args: [account],
            functionName: 'getActiveNonceKeyCount',
        });
    }
    getNonceKeyCount.call = call;
})(getNonceKeyCount || (getNonceKeyCount = {}));
/**
 * @deprecated This function has been deprecated post-AllegroModerato. It will be removed in a future version.
 */
export function watchNonceIncremented(client, parameters) {
    const { onNonceIncremented, ...rest } = parameters;
    return watchContractEvent(client, {
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
/**
 * Watches for active key count changed events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const unwatch = Actions.nonce.watchActiveKeyCountChanged(client, {
 *   onActiveKeyCountChanged: (args, log) => {
 *     console.log('Active key count changed:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchActiveKeyCountChanged(client, parameters) {
    const { onActiveKeyCountChanged, ...rest } = parameters;
    return watchContractEvent(client, {
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