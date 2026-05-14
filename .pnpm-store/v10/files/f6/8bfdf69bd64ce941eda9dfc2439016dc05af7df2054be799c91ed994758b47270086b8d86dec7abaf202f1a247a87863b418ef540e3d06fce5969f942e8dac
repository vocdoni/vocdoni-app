import { type CoinbaseWalletParameters } from 'wagmi/connectors';
import type { Wallet } from '../../Wallet';
export interface CoinbaseWalletOptions {
    appName: string;
    appIcon?: string;
}
type AcceptedCoinbaseWalletParameters = Omit<CoinbaseWalletParameters<'4'>, 'headlessMode' | 'version' | 'appName' | 'appLogoUrl'>;
interface CoinbaseWallet extends AcceptedCoinbaseWalletParameters {
    (params: CoinbaseWalletOptions): Wallet;
}
/**
 * @deprecated Use `baseAccount` instead. This wallet connector will be removed in a future version.
 */
export declare const coinbaseWallet: CoinbaseWallet;
export {};
