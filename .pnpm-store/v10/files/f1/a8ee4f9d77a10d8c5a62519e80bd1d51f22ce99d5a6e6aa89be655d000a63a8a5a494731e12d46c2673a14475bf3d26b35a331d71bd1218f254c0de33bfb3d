import type { Transport } from 'viem';
import { type CreateConfigParameters } from 'wagmi';
import type { RainbowKitChain } from '../components/RainbowKitProvider/RainbowKitChainContext';
import type { RainbowKitWalletConnectParameters, WalletList } from '../wallets/Wallet';
export type _chains = readonly [RainbowKitChain, ...RainbowKitChain[]];
export type _transports = Record<_chains[number]['id'], Transport>;
interface GetDefaultConfigParameters<chains extends _chains, transports extends _transports> extends Omit<CreateConfigParameters<chains, transports>, 'client' | 'connectors'> {
    appName: string;
    appDescription?: string;
    appUrl?: string;
    appIcon?: string;
    wallets?: WalletList;
    projectId: string;
    walletConnectParameters?: RainbowKitWalletConnectParameters;
}
export declare const getDefaultConfig: <chains extends _chains, transports extends _transports>({ appName, appDescription, appUrl, appIcon, wallets, projectId, walletConnectParameters, ...wagmiParameters }: GetDefaultConfigParameters<chains, transports>) => import("wagmi").Config<chains, transports, import("wagmi").CreateConnectorFn[]>;
export {};
