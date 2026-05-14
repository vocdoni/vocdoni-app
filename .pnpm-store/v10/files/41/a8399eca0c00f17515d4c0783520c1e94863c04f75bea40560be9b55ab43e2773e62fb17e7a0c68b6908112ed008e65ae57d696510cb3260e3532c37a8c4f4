import * as React from 'react';
import * as QrCode from './QrCode.js';
/**
 * Renders a QR code with a finder pattern, cells, and an `arena` (if provided).
 *
 * @params {@link Cuer.Props}
 * @returns A {@link React.ReactNode}
 */
export declare function Cuer(props: Cuer.Props): import("react/jsx-runtime.js").JSX.Element;
export declare namespace Cuer {
    type Props = React.PropsWithChildren<QrCode.QrCode.Options & {
        /**
         * Arena to display in the center of the QR code.
         *
         * - `string`: will be rendered as an image.
         * - `ReactNode`: will be rendered as a node.
         */
        arena?: React.ReactNode | string | undefined;
        /**
         * Class name for the root element.
         */
        className?: string | undefined;
        /**
         * Foreground color for the QR code.
         *
         * @default "currentColor"
         */
        color?: string | undefined;
        /**
         * Size for the QR code.
         *
         * @default "100%"
         */
        size?: React.CSSProperties['width'] | undefined;
        /**
         * Value to encode in the QR code.
         */
        value: string;
    }>;
    const Context: React.Context<{
        arenaSize: number;
        cellSize: number;
        edgeSize: number;
        finderSize: number;
        qrcode: QrCode.QrCode;
    }>;
    /**
     * Root component for the QR code.
     *
     * @params {@link Root.Props}
     * @returns A {@link React.ReactNode}
     */
    function Root(props: Root.Props): import("react/jsx-runtime.js").JSX.Element;
    namespace Root {
        const displayName = "Root";
        type Props = React.PropsWithChildren<QrCode.QrCode.Options & Omit<React.SVGProps<SVGSVGElement>, 'children' | 'width' | 'height' | 'version'> & {
            /**
             * Size for the QR code.
             *
             * @default "100%"
             */
            size?: React.CSSProperties['width'] | undefined;
            /**
             * Value to encode in the QR code.
             */
            value: string;
        }>;
    }
    /**
     * Finder component for the QR code. The finder pattern is the squares
     * on the top left, top right, and bottom left of the QR code.
     *
     * @params {@link Finder.Props}
     * @returns A {@link React.ReactNode}
     */
    function Finder(props: Finder.Props): import("react/jsx-runtime.js").JSX.Element;
    namespace Finder {
        const displayName = "Finder";
        type Props = Pick<React.SVGProps<SVGRectElement>, 'className' | 'stroke' | 'fill'> & {
            /**
             * Class name for the inner rectangle.
             */
            innerClassName?: string | undefined;
            /**
             * Radius scale (between 0 and 1) for the finder.
             *
             * - `0`: no radius
             * - `1`: full radius
             *
             * @default 0.25
             */
            radius?: number | undefined;
        };
    }
    /**
     * Cells for the QR code.
     *
     * @params {@link Cells.Props}
     * @returns A {@link React.ReactNode}
     */
    function Cells(props: Cells.Props): import("react/jsx-runtime.js").JSX.Element;
    namespace Cells {
        const displayName = "Cells";
        type Props = Pick<React.SVGProps<SVGPathElement>, 'className' | 'filter' | 'fill'> & {
            /**
             * @deprecated @internal
             */
            hasArena?: boolean | undefined;
            /**
             * Whether to add an inset to the cells.
             *
             * @default true
             */
            inset?: boolean | undefined;
            /**
             * Radius scale (between 0 and 1) for the cells.
             *
             * - `0`: no radius
             * - `1`: full radius
             *
             * @default 1
             */
            radius?: number | undefined;
        };
    }
    /**
     * Arena component for the QR code. The arena is the area in the center
     * of the QR code that is not part of the finder pattern.
     *
     * @params {@link Arena.Props}
     * @returns A {@link React.ReactNode}
     */
    function Arena(props: Arena.Props): import("react/jsx-runtime.js").JSX.Element;
    namespace Arena {
        const displayName = "Arena";
        type Props = {
            children: React.ReactNode;
        };
    }
}
//# sourceMappingURL=Cuer.d.ts.map