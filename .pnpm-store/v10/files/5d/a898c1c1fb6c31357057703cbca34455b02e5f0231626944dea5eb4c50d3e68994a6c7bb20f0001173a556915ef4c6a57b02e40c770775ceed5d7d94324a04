import React from 'react';
import { type WalletConnector } from '../../wallets/useWalletConnectors';
import { WalletStep } from './DesktopOptions';
export declare function GetDetail({ getWalletDownload, compactModeEnabled, }: {
    getWalletDownload: (walletId: string) => void;
    compactModeEnabled: boolean;
}): React.JSX.Element;
export declare function ConnectDetail({ changeWalletStep, compactModeEnabled, connectionError, onClose, qrCodeUri, reconnect, wallet, }: {
    changeWalletStep: (newWalletStep: WalletStep) => void;
    compactModeEnabled: boolean;
    connectionError: boolean;
    qrCodeUri?: string;
    reconnect: (wallet: WalletConnector) => void;
    wallet: WalletConnector;
    onClose: () => void;
}): React.JSX.Element;
export declare function DownloadOptionsDetail({ changeWalletStep, wallet, }: {
    changeWalletStep: (newWalletStep: WalletStep) => void;
    wallet: WalletConnector;
}): React.JSX.Element;
export declare function DownloadDetail({ changeWalletStep, wallet, }: {
    changeWalletStep: (newWalletStep: WalletStep) => void;
    wallet: WalletConnector;
}): React.JSX.Element;
export declare function InstructionMobileDetail({ connectWallet, wallet, }: {
    connectWallet: (wallet: WalletConnector) => void;
    wallet: WalletConnector;
}): React.JSX.Element;
export declare function InstructionExtensionDetail({ wallet, }: {
    wallet: WalletConnector;
}): React.JSX.Element;
export declare function InstructionDesktopDetail({ connectWallet, wallet, }: {
    connectWallet: (wallet: WalletConnector) => void;
    wallet: WalletConnector;
}): React.JSX.Element;
