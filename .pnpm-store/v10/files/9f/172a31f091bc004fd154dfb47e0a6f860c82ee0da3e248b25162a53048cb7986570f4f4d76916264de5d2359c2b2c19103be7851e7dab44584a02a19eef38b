import React, { type ReactNode } from 'react';
import { type WalletConnector } from '../../wallets/useWalletConnectors';
export interface WalletButtonRendererProps {
    wallet?: string;
    children: (renderProps: {
        error: boolean;
        loading: boolean;
        connected: boolean;
        ready: boolean;
        mounted: boolean;
        connector: WalletConnector;
        connect: () => Promise<void>;
    }) => ReactNode;
}
export declare function WalletButtonRenderer({ wallet, children, }: WalletButtonRendererProps): React.JSX.Element;
