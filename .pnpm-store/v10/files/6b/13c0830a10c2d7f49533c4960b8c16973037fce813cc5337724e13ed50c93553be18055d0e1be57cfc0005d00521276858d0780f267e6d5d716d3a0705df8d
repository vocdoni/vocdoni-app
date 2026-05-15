import type { WalletInstance } from './Wallet';
export declare const groupedWallets: (recentWallets: WalletInstance[], walletInstances: WalletInstance[]) => WalletInstance[];
export declare const isRecentWallet: (recentWallets: WalletInstance[], walletId: string) => boolean;
export declare const isRainbowKitConnector: (wallet: WalletInstance) => boolean;
export declare const isEIP6963Connector: (wallet: WalletInstance) => boolean;
export declare const rainbowKitConnectorWithWalletConnect: (wallet: WalletInstance, walletConnectModalConnector: WalletInstance) => WalletInstance;
interface ConnectorsWithWalletsParams {
    wallets: WalletInstance[];
    recentWallets: WalletInstance[];
}
export declare const connectorsWithRecentWallets: ({ wallets, recentWallets, }: ConnectorsWithWalletsParams) => WalletInstance[];
export {};
