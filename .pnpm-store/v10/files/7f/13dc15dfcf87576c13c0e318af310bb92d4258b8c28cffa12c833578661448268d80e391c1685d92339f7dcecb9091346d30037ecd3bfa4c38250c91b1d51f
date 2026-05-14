import React from 'react';
import type { useSwitchChain } from 'wagmi';
import type { AsyncImageSrc } from '../AsyncImage/useAsyncImage';
import { type BoxProps } from '../Box/Box';
interface ChainProps {
    chainId: number;
    currentChainId: number;
    switchChain: ReturnType<typeof useSwitchChain>['switchChain'];
    chainIconSize: BoxProps['height'];
    name: string | undefined;
    isLoading: boolean;
    iconBackground: string | undefined;
    src: string | AsyncImageSrc | undefined | null;
    idx: number;
}
declare const Chain: ({ chainId, currentChainId, switchChain, chainIconSize, isLoading, src, name, iconBackground, idx, }: ChainProps) => React.JSX.Element;
export default Chain;
