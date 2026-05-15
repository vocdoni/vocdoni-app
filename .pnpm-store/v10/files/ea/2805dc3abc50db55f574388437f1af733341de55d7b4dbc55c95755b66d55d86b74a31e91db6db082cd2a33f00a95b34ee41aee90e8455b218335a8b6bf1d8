import { type MetaMaskParameters } from 'wagmi/connectors';
import type { DefaultWalletOptions, Wallet } from '../../Wallet';
export type MetaMaskWalletOptions = DefaultWalletOptions;
type AcceptedMetaMaskParameters = Omit<MetaMaskParameters, 'checkInstallationImmediately' | 'connectWith' | 'dappMetadata' | 'headless' | 'preferDesktop'>;
interface MetaMaskWallet extends AcceptedMetaMaskParameters {
    (params: MetaMaskWalletOptions): Wallet;
}
export declare const metaMaskWallet: MetaMaskWallet;
export {};
