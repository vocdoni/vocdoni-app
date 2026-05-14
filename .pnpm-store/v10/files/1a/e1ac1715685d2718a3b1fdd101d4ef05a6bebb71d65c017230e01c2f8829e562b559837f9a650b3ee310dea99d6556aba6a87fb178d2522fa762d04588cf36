import React, { type ReactNode } from 'react';
interface ModalProviderProps {
    children: ReactNode;
}
export declare function ModalProvider({ children }: ModalProviderProps): React.JSX.Element;
export declare function useModalState(): {
    accountModalOpen: boolean;
    chainModalOpen: boolean;
    connectModalOpen: boolean;
};
export declare function useAccountModal(): {
    accountModalOpen: boolean;
    openAccountModal: (() => void) | undefined;
};
export declare function useChainModal(): {
    chainModalOpen: boolean;
    openChainModal: (() => void) | undefined;
};
export declare function useWalletConnectOpenState(): {
    isWalletConnectModalOpen: boolean;
    setIsWalletConnectModalOpen: (isWalletConnectModalOpen: boolean) => void;
};
export declare function useConnectModal(): {
    connectModalOpen: boolean;
    openConnectModal: (() => void) | undefined;
};
export {};
