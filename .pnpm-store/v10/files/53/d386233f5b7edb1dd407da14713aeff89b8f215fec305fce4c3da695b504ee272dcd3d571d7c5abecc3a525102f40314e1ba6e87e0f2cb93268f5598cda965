import type { Address } from 'viem';
interface UseProfileParameters {
    address?: Address;
    includeBalance?: boolean;
}
export declare function useProfile({ address, includeBalance }: UseProfileParameters): {
    ensName: string | null | undefined;
    ensAvatar: import("viem").GetEnsAvatarReturnType | undefined;
    balance: {
        decimals: number;
        formatted: string;
        symbol: string;
        value: bigint;
    } | undefined;
};
export {};
