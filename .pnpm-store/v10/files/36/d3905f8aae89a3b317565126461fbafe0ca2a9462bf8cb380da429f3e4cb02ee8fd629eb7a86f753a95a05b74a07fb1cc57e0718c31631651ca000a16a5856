import React, { type ReactNode } from 'react';
export declare const ModalSizeOptions: {
    readonly COMPACT: "compact";
    readonly WIDE: "wide";
};
export type ModalSizes = (typeof ModalSizeOptions)[keyof typeof ModalSizeOptions];
export declare const ModalSizeContext: React.Context<ModalSizes>;
interface ModalSizeProviderProps {
    children: ReactNode;
    modalSize: ModalSizes;
}
export declare function ModalSizeProvider({ children, modalSize, }: ModalSizeProviderProps): React.JSX.Element;
export {};
