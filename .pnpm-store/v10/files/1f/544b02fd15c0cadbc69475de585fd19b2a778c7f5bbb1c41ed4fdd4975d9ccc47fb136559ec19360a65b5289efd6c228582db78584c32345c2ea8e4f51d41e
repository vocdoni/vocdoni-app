import { type BaseAccountParameters } from 'wagmi/connectors';
import type { Wallet } from '../../Wallet';
export interface BaseAccountOptions {
    appName: string;
    appIcon?: string;
}
type AcceptedBaseAccountParameters = Omit<BaseAccountParameters, 'appName' | 'appLogoUrl'>;
interface BaseAccount extends AcceptedBaseAccountParameters {
    (params: BaseAccountOptions): Wallet;
}
export declare const baseAccount: BaseAccount;
export {};
