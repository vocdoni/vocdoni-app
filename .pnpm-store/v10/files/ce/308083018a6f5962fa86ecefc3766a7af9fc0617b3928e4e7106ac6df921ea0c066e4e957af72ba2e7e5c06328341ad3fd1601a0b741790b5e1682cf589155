import type { Address } from 'abitype';
import type { Account } from '../../accounts/types.js';
import type { ReadContractReturnType } from '../../actions/public/readContract.js';
import type { WatchContractEventParameters, WatchContractEventReturnType } from '../../actions/public/watchContractEvent.js';
import type { WriteContractReturnType } from '../../actions/wallet/writeContract.js';
import { writeContract } from '../../actions/wallet/writeContract.js';
import { writeContractSync } from '../../actions/wallet/writeContractSync.js';
import type { Client } from '../../clients/createClient.js';
import type { Transport } from '../../clients/transports/createTransport.js';
import type { BaseErrorType } from '../../errors/base.js';
import type { Chain } from '../../types/chain.js';
import type { ExtractAbiItem, GetEventArgs } from '../../types/contract.js';
import type { Log, Log as viem_Log } from '../../types/log.js';
import type { UnionOmit } from '../../types/utils.js';
import * as Abis from '../Abis.js';
import type { ReadParameters, WriteParameters } from '../internal/types.js';
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
export declare function claim<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: claim.Parameters<chain, account>): Promise<claim.ReturnValue>;
export declare namespace claim {
    type Args = {
        /** The TIP20 token address */
        token: Address;
    };
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = WriteParameters<chain, account> & Args;
    type ReturnValue = WriteContractReturnType;
    type ErrorType = BaseErrorType;
    /** @internal */
    function inner<action extends typeof writeContract | typeof writeContractSync, chain extends Chain | undefined, account extends Account | undefined>(action: action, client: Client<Transport, chain, account>, parameters: Parameters<chain, account>): Promise<ReturnType<action>>;
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
    function call(args: Args): {
        abi: [{
            readonly name: "claimRewards";
            readonly type: "function";
            readonly stateMutability: "nonpayable";
            readonly inputs: readonly [];
            readonly outputs: readonly [{
                readonly type: "uint256";
            }];
        }];
        functionName: "claimRewards";
    } & {
        args?: readonly [] | undefined;
    } & {
        address: Address;
    } & {
        data: import("../../index.js").Hex;
        to: Address;
    };
}
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
export declare function claimSync<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: claimSync.Parameters<chain, account>): Promise<claimSync.ReturnValue>;
export declare namespace claimSync {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = WriteParameters<chain, account> & claim.Args;
    type ReturnValue = {
        /** The transaction receipt */
        receipt: Awaited<ReturnType<typeof writeContractSync>>;
    };
    type ErrorType = claim.ErrorType;
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
export declare function getTotalPerSecond<chain extends Chain | undefined>(client: Client<Transport, chain>, parameters: getTotalPerSecond.Parameters): Promise<getTotalPerSecond.ReturnValue>;
export declare namespace getTotalPerSecond {
    type Parameters = ReadParameters & Args;
    type Args = {
        /** The TIP20 token address */
        token: Address;
    };
    type ReturnValue = ReadContractReturnType<typeof Abis.tip20, 'totalRewardPerSecond', never>;
    /**
     * Defines a call to the `totalRewardPerSecond` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args: Args): {
        abi: [{
            readonly name: "totalRewardPerSecond";
            readonly type: "function";
            readonly stateMutability: "view";
            readonly inputs: readonly [];
            readonly outputs: readonly [{
                readonly type: "uint256";
            }];
        }];
        functionName: "totalRewardPerSecond";
    } & {
        args?: readonly [] | undefined;
    } & {
        address: Address;
    } & {
        data: import("../../index.js").Hex;
        to: Address;
    };
}
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
export declare function getUserRewardInfo<chain extends Chain | undefined>(client: Client<Transport, chain>, parameters: getUserRewardInfo.Parameters): Promise<getUserRewardInfo.ReturnValue>;
export declare namespace getUserRewardInfo {
    type Parameters = ReadParameters & Args;
    type Args = {
        /** The account address to query reward info for */
        account: Address;
        /** The TIP20 token address */
        token: Address;
    };
    type ReturnValue = ReadContractReturnType<typeof Abis.tip20, 'userRewardInfo', never>;
    /**
     * Defines a call to the `userRewardInfo` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args: Args): {
        abi: [{
            readonly name: "userRewardInfo";
            readonly type: "function";
            readonly stateMutability: "view";
            readonly inputs: readonly [{
                readonly type: "address";
                readonly name: "account";
            }];
            readonly outputs: readonly [{
                readonly type: "tuple";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "rewardRecipient";
                }, {
                    readonly type: "uint256";
                    readonly name: "rewardPerToken";
                }, {
                    readonly type: "uint256";
                    readonly name: "rewardBalance";
                }];
            }];
        }];
        functionName: "userRewardInfo";
    } & {
        args: readonly [account: `0x${string}`];
    } & {
        address: Address;
    } & {
        data: import("../../index.js").Hex;
        to: Address;
    };
}
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
export declare function setRecipient<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: setRecipient.Parameters<chain, account>): Promise<setRecipient.ReturnValue>;
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
export declare function setRecipientSync<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: setRecipientSync.Parameters<chain, account>): Promise<setRecipientSync.ReturnValue>;
export declare namespace setRecipient {
    type Args = {
        /** The reward recipient address (use zero address to opt out of rewards) */
        recipient: Address;
        /** The TIP20 token address */
        token: Address;
    };
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = WriteParameters<chain, account> & Args;
    type ReturnValue = WriteContractReturnType;
    type ErrorType = BaseErrorType;
    /** @internal */
    function inner<action extends typeof writeContract | typeof writeContractSync, chain extends Chain | undefined, account extends Account | undefined>(action: action, client: Client<Transport, chain, account>, parameters: Parameters<chain, account>): Promise<ReturnType<action>>;
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
    function call(args: Args): {
        abi: [{
            readonly name: "setRewardRecipient";
            readonly type: "function";
            readonly stateMutability: "nonpayable";
            readonly inputs: readonly [{
                readonly type: "address";
                readonly name: "recipient";
            }];
            readonly outputs: readonly [];
        }];
        functionName: "setRewardRecipient";
    } & {
        args: readonly [recipient: `0x${string}`];
    } & {
        address: Address;
    } & {
        data: import("../../index.js").Hex;
        to: Address;
    };
    /**
     * Extracts the `RewardRecipientSet` event from logs.
     *
     * @param logs - The logs.
     * @returns The `RewardRecipientSet` event.
     */
    function extractEvent(logs: Log[]): Log<bigint, number, false, undefined, true, readonly [{
        readonly name: "name";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "string";
        }];
    }, {
        readonly name: "symbol";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "string";
        }];
    }, {
        readonly name: "decimals";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint8";
        }];
    }, {
        readonly name: "totalSupply";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint256";
        }];
    }, {
        readonly name: "quoteToken";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "address";
        }];
    }, {
        readonly name: "nextQuoteToken";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "address";
        }];
    }, {
        readonly name: "balanceOf";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }];
        readonly outputs: readonly [{
            readonly type: "uint256";
        }];
    }, {
        readonly name: "transfer";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "to";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "approve";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "spender";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "allowance";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "owner";
        }, {
            readonly type: "address";
            readonly name: "spender";
        }];
        readonly outputs: readonly [{
            readonly type: "uint256";
        }];
    }, {
        readonly name: "transferFrom";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "from";
        }, {
            readonly type: "address";
            readonly name: "to";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "mint";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "to";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "burn";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "uint256";
            readonly name: "amount";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "currency";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "string";
        }];
    }, {
        readonly name: "supplyCap";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint256";
        }];
    }, {
        readonly name: "paused";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "transferPolicyId";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint64";
        }];
    }, {
        readonly name: "burnBlocked";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "from";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "mintWithMemo";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "to";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "bytes32";
            readonly name: "memo";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "burnWithMemo";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "bytes32";
            readonly name: "memo";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "transferWithMemo";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "to";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "bytes32";
            readonly name: "memo";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "transferFromWithMemo";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "from";
        }, {
            readonly type: "address";
            readonly name: "to";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "bytes32";
            readonly name: "memo";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "feeRecipient";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "address";
        }];
    }, {
        readonly name: "setFeeRecipient";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "newRecipient";
        }];
        readonly outputs: readonly [{
            readonly type: "address";
        }];
    }, {
        readonly name: "changeTransferPolicyId";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "newPolicyId";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "setSupplyCap";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "uint256";
            readonly name: "newSupplyCap";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "pause";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [];
        readonly outputs: readonly [];
    }, {
        readonly name: "unpause";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [];
        readonly outputs: readonly [];
    }, {
        readonly name: "setNextQuoteToken";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "newQuoteToken";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "completeQuoteTokenUpdate";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [];
        readonly outputs: readonly [];
    }, {
        readonly name: "PAUSE_ROLE";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "UNPAUSE_ROLE";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "ISSUER_ROLE";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "BURN_BLOCKED_ROLE";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "startReward";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "uint32";
            readonly name: "secs";
        }];
        readonly outputs: readonly [{
            readonly type: "uint64";
        }];
    }, {
        readonly name: "setRewardRecipient";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "recipient";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "cancelReward";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "id";
        }];
        readonly outputs: readonly [{
            readonly type: "uint256";
        }];
    }, {
        readonly name: "claimRewards";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint256";
        }];
    }, {
        readonly name: "finalizeStreams";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "timestamp";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "getStream";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "id";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "funder";
            }, {
                readonly type: "uint64";
                readonly name: "startTime";
            }, {
                readonly type: "uint64";
                readonly name: "endTime";
            }, {
                readonly type: "uint256";
                readonly name: "ratePerSecondScaled";
            }, {
                readonly type: "uint256";
                readonly name: "amountTotal";
            }];
        }];
    }, {
        readonly name: "totalRewardPerSecond";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint256";
        }];
    }, {
        readonly name: "optedInSupply";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint128";
        }];
    }, {
        readonly name: "nextStreamId";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint64";
        }];
    }, {
        readonly name: "userRewardInfo";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "rewardRecipient";
            }, {
                readonly type: "uint256";
                readonly name: "rewardPerToken";
            }, {
                readonly type: "uint256";
                readonly name: "rewardBalance";
            }];
        }];
    }, {
        readonly name: "Transfer";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "from";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "to";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
    }, {
        readonly name: "Approval";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "owner";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "spender";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
    }, {
        readonly name: "Mint";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "to";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
    }, {
        readonly name: "Burn";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "from";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
    }, {
        readonly name: "BurnBlocked";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "from";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
    }, {
        readonly name: "TransferWithMemo";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "from";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "to";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "bytes32";
            readonly name: "memo";
            readonly indexed: true;
        }];
    }, {
        readonly name: "TransferPolicyUpdate";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "updater";
            readonly indexed: true;
        }, {
            readonly type: "uint64";
            readonly name: "newPolicyId";
            readonly indexed: true;
        }];
    }, {
        readonly name: "SupplyCapUpdate";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "updater";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "newSupplyCap";
            readonly indexed: true;
        }];
    }, {
        readonly name: "PauseStateUpdate";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "updater";
            readonly indexed: true;
        }, {
            readonly type: "bool";
            readonly name: "isPaused";
        }];
    }, {
        readonly name: "NextQuoteTokenSet";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "updater";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "nextQuoteToken";
            readonly indexed: true;
        }];
    }, {
        readonly name: "QuoteTokenUpdate";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "updater";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "newQuoteToken";
            readonly indexed: true;
        }];
    }, {
        readonly name: "RewardScheduled";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "funder";
            readonly indexed: true;
        }, {
            readonly type: "uint64";
            readonly name: "id";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "uint32";
            readonly name: "durationSeconds";
        }];
    }, {
        readonly name: "RewardCanceled";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "funder";
            readonly indexed: true;
        }, {
            readonly type: "uint64";
            readonly name: "id";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "refund";
        }];
    }, {
        readonly name: "RewardRecipientSet";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "holder";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "recipient";
            readonly indexed: true;
        }];
    }, {
        readonly name: "FeeRecipientUpdated";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "updater";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "newRecipient";
            readonly indexed: true;
        }];
    }, {
        readonly name: "InsufficientBalance";
        readonly type: "error";
        readonly inputs: readonly [{
            readonly type: "uint256";
            readonly name: "available";
        }, {
            readonly type: "uint256";
            readonly name: "required";
        }, {
            readonly type: "address";
            readonly name: "token";
        }];
    }, {
        readonly name: "InsufficientAllowance";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "SupplyCapExceeded";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidSupplyCap";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidPayload";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "StringTooLong";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "PolicyForbids";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidRecipient";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ContractPaused";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidCurrency";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidQuoteToken";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "TransfersDisabled";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidAmount";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "NotStreamFunder";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "StreamInactive";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "NoOptedInSupply";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "Unauthorized";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "RewardsDisabled";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ScheduledRewardsDisabled";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ProtectedAddress";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidToken";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "hasRole";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "bytes32";
            readonly name: "role";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "getRoleAdmin";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "role";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "grantRole";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "role";
        }, {
            readonly type: "address";
            readonly name: "account";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "revokeRole";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "role";
        }, {
            readonly type: "address";
            readonly name: "account";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "renounceRole";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "role";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "setRoleAdmin";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "role";
        }, {
            readonly type: "bytes32";
            readonly name: "adminRole";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "RoleMembershipUpdated";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "role";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "sender";
            readonly indexed: true;
        }, {
            readonly type: "bool";
            readonly name: "hasRole";
        }];
    }, {
        readonly name: "RoleAdminUpdated";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "role";
            readonly indexed: true;
        }, {
            readonly type: "bytes32";
            readonly name: "newAdminRole";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "sender";
            readonly indexed: true;
        }];
    }, {
        readonly name: "Unauthorized";
        readonly type: "error";
        readonly inputs: readonly [];
    }], "RewardRecipientSet">;
}
export declare namespace setRecipientSync {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = WriteParameters<chain, account> & setRecipient.Args;
    type ReturnValue = {
        /** The token holder address who set their reward recipient */
        holder: Address;
        /** The transaction receipt */
        receipt: Awaited<ReturnType<typeof writeContractSync>>;
        /** The reward recipient address (zero address indicates opt-out) */
        recipient: Address;
    };
    type ErrorType = setRecipient.ErrorType;
}
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
export declare function start<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: start.Parameters<chain, account>): Promise<start.ReturnValue>;
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
export declare function startSync<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: startSync.Parameters<chain, account>): Promise<startSync.ReturnValue>;
export declare namespace start {
    type Args = {
        /** The amount of tokens to distribute (must be > 0) */
        amount: bigint;
        /** The TIP20 token address */
        token: Address;
    };
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = WriteParameters<chain, account> & Args;
    type ReturnValue = WriteContractReturnType;
    type ErrorType = BaseErrorType;
    /** @internal */
    function inner<action extends typeof writeContract | typeof writeContractSync, chain extends Chain | undefined, account extends Account | undefined>(action: action, client: Client<Transport, chain, account>, parameters: Parameters<chain, account>): Promise<ReturnType<action>>;
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
    function call(args: Args): {
        abi: [{
            readonly name: "startReward";
            readonly type: "function";
            readonly stateMutability: "nonpayable";
            readonly inputs: readonly [{
                readonly type: "uint256";
                readonly name: "amount";
            }, {
                readonly type: "uint32";
                readonly name: "secs";
            }];
            readonly outputs: readonly [{
                readonly type: "uint64";
            }];
        }];
        functionName: "startReward";
    } & {
        args: readonly [amount: bigint, secs: number];
    } & {
        address: Address;
    } & {
        data: import("../../index.js").Hex;
        to: Address;
    };
    /**
     * Extracts the `RewardScheduled` event from logs.
     *
     * @param logs - The logs.
     * @returns The `RewardScheduled` event.
     */
    function extractEvent(logs: Log[]): Log<bigint, number, false, undefined, true, readonly [{
        readonly name: "name";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "string";
        }];
    }, {
        readonly name: "symbol";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "string";
        }];
    }, {
        readonly name: "decimals";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint8";
        }];
    }, {
        readonly name: "totalSupply";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint256";
        }];
    }, {
        readonly name: "quoteToken";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "address";
        }];
    }, {
        readonly name: "nextQuoteToken";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "address";
        }];
    }, {
        readonly name: "balanceOf";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }];
        readonly outputs: readonly [{
            readonly type: "uint256";
        }];
    }, {
        readonly name: "transfer";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "to";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "approve";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "spender";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "allowance";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "owner";
        }, {
            readonly type: "address";
            readonly name: "spender";
        }];
        readonly outputs: readonly [{
            readonly type: "uint256";
        }];
    }, {
        readonly name: "transferFrom";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "from";
        }, {
            readonly type: "address";
            readonly name: "to";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "mint";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "to";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "burn";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "uint256";
            readonly name: "amount";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "currency";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "string";
        }];
    }, {
        readonly name: "supplyCap";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint256";
        }];
    }, {
        readonly name: "paused";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "transferPolicyId";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint64";
        }];
    }, {
        readonly name: "burnBlocked";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "from";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "mintWithMemo";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "to";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "bytes32";
            readonly name: "memo";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "burnWithMemo";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "bytes32";
            readonly name: "memo";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "transferWithMemo";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "to";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "bytes32";
            readonly name: "memo";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "transferFromWithMemo";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "from";
        }, {
            readonly type: "address";
            readonly name: "to";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "bytes32";
            readonly name: "memo";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "feeRecipient";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "address";
        }];
    }, {
        readonly name: "setFeeRecipient";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "newRecipient";
        }];
        readonly outputs: readonly [{
            readonly type: "address";
        }];
    }, {
        readonly name: "changeTransferPolicyId";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "newPolicyId";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "setSupplyCap";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "uint256";
            readonly name: "newSupplyCap";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "pause";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [];
        readonly outputs: readonly [];
    }, {
        readonly name: "unpause";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [];
        readonly outputs: readonly [];
    }, {
        readonly name: "setNextQuoteToken";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "newQuoteToken";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "completeQuoteTokenUpdate";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [];
        readonly outputs: readonly [];
    }, {
        readonly name: "PAUSE_ROLE";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "UNPAUSE_ROLE";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "ISSUER_ROLE";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "BURN_BLOCKED_ROLE";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "startReward";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "uint32";
            readonly name: "secs";
        }];
        readonly outputs: readonly [{
            readonly type: "uint64";
        }];
    }, {
        readonly name: "setRewardRecipient";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "recipient";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "cancelReward";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "id";
        }];
        readonly outputs: readonly [{
            readonly type: "uint256";
        }];
    }, {
        readonly name: "claimRewards";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint256";
        }];
    }, {
        readonly name: "finalizeStreams";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "timestamp";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "getStream";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "id";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "funder";
            }, {
                readonly type: "uint64";
                readonly name: "startTime";
            }, {
                readonly type: "uint64";
                readonly name: "endTime";
            }, {
                readonly type: "uint256";
                readonly name: "ratePerSecondScaled";
            }, {
                readonly type: "uint256";
                readonly name: "amountTotal";
            }];
        }];
    }, {
        readonly name: "totalRewardPerSecond";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint256";
        }];
    }, {
        readonly name: "optedInSupply";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint128";
        }];
    }, {
        readonly name: "nextStreamId";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint64";
        }];
    }, {
        readonly name: "userRewardInfo";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "rewardRecipient";
            }, {
                readonly type: "uint256";
                readonly name: "rewardPerToken";
            }, {
                readonly type: "uint256";
                readonly name: "rewardBalance";
            }];
        }];
    }, {
        readonly name: "Transfer";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "from";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "to";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
    }, {
        readonly name: "Approval";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "owner";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "spender";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
    }, {
        readonly name: "Mint";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "to";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
    }, {
        readonly name: "Burn";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "from";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
    }, {
        readonly name: "BurnBlocked";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "from";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
    }, {
        readonly name: "TransferWithMemo";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "from";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "to";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "bytes32";
            readonly name: "memo";
            readonly indexed: true;
        }];
    }, {
        readonly name: "TransferPolicyUpdate";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "updater";
            readonly indexed: true;
        }, {
            readonly type: "uint64";
            readonly name: "newPolicyId";
            readonly indexed: true;
        }];
    }, {
        readonly name: "SupplyCapUpdate";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "updater";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "newSupplyCap";
            readonly indexed: true;
        }];
    }, {
        readonly name: "PauseStateUpdate";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "updater";
            readonly indexed: true;
        }, {
            readonly type: "bool";
            readonly name: "isPaused";
        }];
    }, {
        readonly name: "NextQuoteTokenSet";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "updater";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "nextQuoteToken";
            readonly indexed: true;
        }];
    }, {
        readonly name: "QuoteTokenUpdate";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "updater";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "newQuoteToken";
            readonly indexed: true;
        }];
    }, {
        readonly name: "RewardScheduled";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "funder";
            readonly indexed: true;
        }, {
            readonly type: "uint64";
            readonly name: "id";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "uint32";
            readonly name: "durationSeconds";
        }];
    }, {
        readonly name: "RewardCanceled";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "funder";
            readonly indexed: true;
        }, {
            readonly type: "uint64";
            readonly name: "id";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "refund";
        }];
    }, {
        readonly name: "RewardRecipientSet";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "holder";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "recipient";
            readonly indexed: true;
        }];
    }, {
        readonly name: "FeeRecipientUpdated";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "updater";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "newRecipient";
            readonly indexed: true;
        }];
    }, {
        readonly name: "InsufficientBalance";
        readonly type: "error";
        readonly inputs: readonly [{
            readonly type: "uint256";
            readonly name: "available";
        }, {
            readonly type: "uint256";
            readonly name: "required";
        }, {
            readonly type: "address";
            readonly name: "token";
        }];
    }, {
        readonly name: "InsufficientAllowance";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "SupplyCapExceeded";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidSupplyCap";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidPayload";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "StringTooLong";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "PolicyForbids";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidRecipient";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ContractPaused";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidCurrency";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidQuoteToken";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "TransfersDisabled";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidAmount";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "NotStreamFunder";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "StreamInactive";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "NoOptedInSupply";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "Unauthorized";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "RewardsDisabled";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ScheduledRewardsDisabled";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ProtectedAddress";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidToken";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "hasRole";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "bytes32";
            readonly name: "role";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "getRoleAdmin";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "role";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "grantRole";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "role";
        }, {
            readonly type: "address";
            readonly name: "account";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "revokeRole";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "role";
        }, {
            readonly type: "address";
            readonly name: "account";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "renounceRole";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "role";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "setRoleAdmin";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "role";
        }, {
            readonly type: "bytes32";
            readonly name: "adminRole";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "RoleMembershipUpdated";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "role";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "sender";
            readonly indexed: true;
        }, {
            readonly type: "bool";
            readonly name: "hasRole";
        }];
    }, {
        readonly name: "RoleAdminUpdated";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "role";
            readonly indexed: true;
        }, {
            readonly type: "bytes32";
            readonly name: "newAdminRole";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "sender";
            readonly indexed: true;
        }];
    }, {
        readonly name: "Unauthorized";
        readonly type: "error";
        readonly inputs: readonly [];
    }], "RewardScheduled">;
}
export declare namespace startSync {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = WriteParameters<chain, account> & start.Args;
    type ReturnValue = {
        /** The total amount allocated to the stream */
        amount: bigint;
        /** The duration of the stream in seconds (0 for immediate distributions) */
        durationSeconds: number;
        /** The address that funded the stream */
        funder: Address;
        /** The unique stream ID (0 for immediate distributions, >0 for streaming distributions) */
        id: bigint;
        /** The transaction receipt */
        receipt: Awaited<ReturnType<typeof writeContractSync>>;
    };
    type ErrorType = start.ErrorType;
}
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
export declare function watchRewardScheduled<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: watchRewardScheduled.Parameters): WatchContractEventReturnType;
export declare namespace watchRewardScheduled {
    type Args = GetEventArgs<typeof Abis.tip20, 'RewardScheduled', {
        IndexedOnly: false;
        Required: true;
    }>;
    type Log = viem_Log<bigint, number, false, ExtractAbiItem<typeof Abis.tip20, 'RewardScheduled'>, true>;
    type Parameters = UnionOmit<WatchContractEventParameters<typeof Abis.tip20, 'RewardScheduled', true>, 'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'> & {
        /** Callback to invoke when rewards are scheduled. */
        onRewardScheduled: (args: Args, log: Log) => void;
        /** The TIP20 token address */
        token: Address;
    };
    type ReturnValue = WatchContractEventReturnType;
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
export declare function watchRewardRecipientSet<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: watchRewardRecipientSet.Parameters): WatchContractEventReturnType;
export declare namespace watchRewardRecipientSet {
    type Args = GetEventArgs<typeof Abis.tip20, 'RewardRecipientSet', {
        IndexedOnly: false;
        Required: true;
    }>;
    type Log = viem_Log<bigint, number, false, ExtractAbiItem<typeof Abis.tip20, 'RewardRecipientSet'>, true>;
    type Parameters = UnionOmit<WatchContractEventParameters<typeof Abis.tip20, 'RewardRecipientSet', true>, 'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'> & {
        /** Callback to invoke when a reward recipient is set. */
        onRewardRecipientSet: (args: Args, log: Log) => void;
        /** The TIP20 token address */
        token: Address;
    };
    type ReturnValue = WatchContractEventReturnType;
}
//# sourceMappingURL=reward.d.ts.map