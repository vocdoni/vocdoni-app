import * as Address from '../core/Address.js';
export type TokenId = bigint;
export type TokenIdOrAddress = TokenId | Address.Address;
/**
 * Converts a token ID or address to a token ID.
 *
 * TIP-20 is Tempo's native token standard for stablecoins with deterministic addresses
 * derived from sequential token IDs (prefix `0x20c0`).
 *
 * [TIP-20 Token Standard](https://docs.tempo.xyz/protocol/tip20/overview)
 *
 * @example
 * ```ts twoslash
 * import { TokenId } from 'ox/tempo'
 *
 * const tokenId = TokenId.from(1n)
 * ```
 *
 * @param tokenIdOrAddress - The token ID or address.
 * @returns The token ID.
 */
export declare function from(tokenIdOrAddress: TokenIdOrAddress | number): TokenId;
/**
 * Converts a TIP-20 token address to a token ID.
 *
 * [TIP-20 Token Standard](https://docs.tempo.xyz/protocol/tip20/overview)
 *
 * @example
 * ```ts twoslash
 * import { TokenId } from 'ox/tempo'
 *
 * const tokenId = TokenId.fromAddress('0x20c00000000000000000000000000000000000000001')
 * ```
 *
 * @param address - The token address.
 * @returns The token ID.
 */
export declare function fromAddress(address: Address.Address): TokenId;
/**
 * Converts a TIP-20 token ID to an address.
 *
 * [TIP-20 Token Standard](https://docs.tempo.xyz/protocol/tip20/overview)
 *
 * @example
 * ```ts twoslash
 * import { TokenId } from 'ox/tempo'
 *
 * const address = TokenId.toAddress(1n)
 * ```
 *
 * @param tokenId - The token ID.
 * @returns The address.
 */
export declare function toAddress(tokenId: TokenIdOrAddress): Address.Address;
//# sourceMappingURL=TokenId.d.ts.map