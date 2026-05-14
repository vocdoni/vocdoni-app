import React, { type ReactNode } from 'react';
import type { Chain } from 'wagmi/chains';
import type { ThemeVars } from '../../css/sprinkles.css';
import type { Locale } from '../../locales';
import { type DisclaimerComponent } from './AppContext';
import { type AvatarComponent } from './AvatarContext';
import { type ModalSizes } from './ModalSizeContext';
export declare const useThemeRootProps: () => {
    "data-rk": string;
};
export type Theme = ThemeVars | {
    lightMode: ThemeVars;
    darkMode: ThemeVars;
};
export interface RainbowKitProviderProps {
    initialChain?: Chain | number;
    id?: string;
    children: ReactNode;
    theme?: Theme | null;
    showRecentTransactions?: boolean;
    appInfo?: {
        appName?: string;
        learnMoreUrl?: string;
        disclaimer?: DisclaimerComponent;
    };
    coolMode?: boolean;
    avatar?: AvatarComponent;
    modalSize?: ModalSizes;
    locale?: Locale;
}
export declare function RainbowKitProvider({ appInfo, avatar, children, coolMode, id, initialChain, locale, modalSize, showRecentTransactions, theme, }: RainbowKitProviderProps): React.JSX.Element;
