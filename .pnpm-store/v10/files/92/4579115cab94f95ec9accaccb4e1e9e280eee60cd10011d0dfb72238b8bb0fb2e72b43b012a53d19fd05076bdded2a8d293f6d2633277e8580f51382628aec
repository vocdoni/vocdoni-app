import type { CreateConnectorFn } from 'wagmi';
import type { RainbowKitWalletConnectParameters, WalletList } from './Wallet';
export interface ConnectorsForWalletsParameters {
    projectId: string;
    appName: string;
    appDescription?: string;
    appUrl?: string;
    appIcon?: string;
    walletConnectParameters?: RainbowKitWalletConnectParameters;
}
export declare const connectorsForWallets: (walletList: WalletList, { projectId, walletConnectParameters, appName, appDescription, appUrl, appIcon, }: ConnectorsForWalletsParameters) => CreateConnectorFn[];
