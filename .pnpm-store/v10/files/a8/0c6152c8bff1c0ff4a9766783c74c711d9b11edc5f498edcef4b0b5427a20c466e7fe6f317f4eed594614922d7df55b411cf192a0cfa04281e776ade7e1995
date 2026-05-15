import React, { type ReactNode } from 'react';
import type { Chain } from 'wagmi/chains';
export interface RainbowKitChain extends Chain {
    iconUrl?: string | (() => Promise<string>) | null;
    iconBackground?: string;
}
interface RainbowKitChainProviderProps {
    initialChain?: Chain | number;
    children: ReactNode;
}
export declare function RainbowKitChainProvider({ children, initialChain, }: RainbowKitChainProviderProps): React.JSX.Element;
export declare const useRainbowKitChains: () => RainbowKitChain[];
export declare const useInitialChainId: () => number | undefined;
export declare const useRainbowKitChainsById: () => Record<number, RainbowKitChain>;
export {};
