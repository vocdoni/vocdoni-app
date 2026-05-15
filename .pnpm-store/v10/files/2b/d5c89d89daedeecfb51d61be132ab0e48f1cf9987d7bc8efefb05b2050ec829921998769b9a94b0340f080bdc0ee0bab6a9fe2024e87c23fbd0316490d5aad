import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import * as QrCode from './QrCode.js';
/**
 * Renders a QR code with a finder pattern, cells, and an `arena` (if provided).
 *
 * @params {@link Cuer.Props}
 * @returns A {@link React.ReactNode}
 */
export function Cuer(props) {
    const { arena, ...rest } = props;
    return (_jsxs(Cuer.Root, { ...rest, children: [_jsx(Cuer.Finder, {}), _jsx(Cuer.Cells, {}), arena && (_jsx(Cuer.Arena, { children: typeof arena === 'string' ? (_jsx("img", { alt: "Arena", src: arena, style: {
                        borderRadius: 1,
                        height: '100%',
                        objectFit: 'cover',
                        width: '100%',
                    } })) : (arena) }))] }));
}
(function (Cuer) {
    Cuer.Context = React.createContext(null);
    /**
     * Root component for the QR code.
     *
     * @params {@link Root.Props}
     * @returns A {@link React.ReactNode}
     */
    function Root(props) {
        const { children, size = '100%', value, version, errorCorrection, ...rest } = props;
        // Check if the children contain an `Arena` component.
        const hasArena = React.useMemo(() => (React.Children.map(children, (child) => {
            if (!React.isValidElement(child))
                return null;
            if (typeof child.type === 'string')
                return null;
            if ('displayName' in child.type &&
                child.type.displayName === 'Arena')
                return true;
            return null;
        }) ?? []).some(Boolean), [children]);
        // Create the QR code.
        const qrcode = React.useMemo(() => {
            let ecl = errorCorrection;
            // If the QR code has an arena, use a higher error correction level.
            if (hasArena && errorCorrection === 'low')
                ecl = 'medium';
            return QrCode.create(value, {
                errorCorrection: ecl,
                version,
            });
        }, [value, hasArena, errorCorrection, version]);
        const cellSize = 1;
        const edgeSize = qrcode.edgeLength * cellSize;
        const finderSize = (qrcode.finderLength * cellSize) / 2;
        const arenaSize = hasArena ? Math.floor(edgeSize / 4) : 0;
        const context = React.useMemo(() => ({ arenaSize, cellSize, edgeSize, qrcode, finderSize }), [arenaSize, edgeSize, qrcode, finderSize]);
        return (_jsx(Cuer.Context.Provider, { value: context, children: _jsxs("svg", { ...rest, width: size, height: size, viewBox: `0 0 ${edgeSize} ${edgeSize}`, xmlns: "http://www.w3.org/2000/svg", children: [_jsx("title", { children: "QR Code" }), children] }) }));
    }
    Cuer.Root = Root;
    (function (Root) {
        Root.displayName = 'Root';
    })(Root = Cuer.Root || (Cuer.Root = {}));
    /**
     * Finder component for the QR code. The finder pattern is the squares
     * on the top left, top right, and bottom left of the QR code.
     *
     * @params {@link Finder.Props}
     * @returns A {@link React.ReactNode}
     */
    function Finder(props) {
        const { className, fill, innerClassName, radius = 0.25 } = props;
        const { cellSize, edgeSize, finderSize } = React.useContext(Cuer.Context);
        function Inner({ position }) {
            let outerX = finderSize - (finderSize - cellSize) - cellSize / 2;
            if (position === 'top-right')
                outerX = edgeSize - finderSize - (finderSize - cellSize) - cellSize / 2;
            let outerY = finderSize - (finderSize - cellSize) - cellSize / 2;
            if (position === 'bottom-left')
                outerY = edgeSize - finderSize - (finderSize - cellSize) - cellSize / 2;
            let innerX = finderSize - cellSize * 1.5;
            if (position === 'top-right')
                innerX = edgeSize - finderSize - cellSize * 1.5;
            let innerY = finderSize - cellSize * 1.5;
            if (position === 'bottom-left')
                innerY = edgeSize - finderSize - cellSize * 1.5;
            return (_jsxs(_Fragment, { children: [_jsx("rect", { className: className, stroke: fill ?? 'currentColor', fill: "transparent", x: outerX, y: outerY, width: cellSize + (finderSize - cellSize) * 2, height: cellSize + (finderSize - cellSize) * 2, rx: 2 * radius * (finderSize - cellSize), ry: 2 * radius * (finderSize - cellSize), strokeWidth: cellSize }), _jsx("rect", { className: innerClassName, fill: fill ?? 'currentColor', x: innerX, y: innerY, width: cellSize * 3, height: cellSize * 3, rx: 2 * radius * cellSize, ry: 2 * radius * cellSize })] }));
        }
        return (_jsxs(_Fragment, { children: [_jsx(Inner, { position: "top-left" }), _jsx(Inner, { position: "top-right" }), _jsx(Inner, { position: "bottom-left" })] }));
    }
    Cuer.Finder = Finder;
    (function (Finder) {
        Finder.displayName = 'Finder';
    })(Finder = Cuer.Finder || (Cuer.Finder = {}));
    /**
     * Cells for the QR code.
     *
     * @params {@link Cells.Props}
     * @returns A {@link React.ReactNode}
     */
    function Cells(props) {
        const { className, fill = 'currentColor', inset: inset_ = true, radius = 1, } = props;
        const { arenaSize, cellSize, qrcode } = React.useContext(Cuer.Context);
        const { edgeLength, finderLength } = qrcode;
        const path = React.useMemo(() => {
            let path = '';
            for (let i = 0; i < qrcode.grid.length; i++) {
                const row = qrcode.grid[i];
                if (!row)
                    continue;
                for (let j = 0; j < row.length; j++) {
                    const cell = row[j];
                    if (!cell)
                        continue;
                    // Skip rendering dots in arena area.
                    const start = edgeLength / 2 - arenaSize / 2;
                    const end = start + arenaSize;
                    if (i >= start && i <= end && j >= start && j <= end)
                        continue;
                    // Skip rendering dots in the finder pattern areas
                    const topLeftFinder = i < finderLength && j < finderLength;
                    const topRightFinder = i < finderLength && j >= edgeLength - finderLength;
                    const bottomLeftFinder = i >= edgeLength - finderLength && j < finderLength;
                    if (topLeftFinder || topRightFinder || bottomLeftFinder)
                        continue;
                    // Add inset for padding
                    const inset = inset_ ? cellSize * 0.1 : 0;
                    const innerSize = (cellSize - inset * 2) / 2;
                    // Calculate center positions
                    const cx = j * cellSize + cellSize / 2;
                    const cy = i * cellSize + cellSize / 2;
                    // Calculate edge positions
                    const left = cx - innerSize;
                    const right = cx + innerSize;
                    const top = cy - innerSize;
                    const bottom = cy + innerSize;
                    // Apply corner radius (clamped to maximum of innerSize)
                    const r = radius * innerSize;
                    path += [
                        `M ${left + r},${top}`,
                        `L ${right - r},${top}`,
                        `A ${r},${r} 0 0,1 ${right},${top + r}`,
                        `L ${right},${bottom - r}`,
                        `A ${r},${r} 0 0,1 ${right - r},${bottom}`,
                        `L ${left + r},${bottom}`,
                        `A ${r},${r} 0 0,1 ${left},${bottom - r}`,
                        `L ${left},${top + r}`,
                        `A ${r},${r} 0 0,1 ${left + r},${top}`,
                        'z',
                    ].join(' ');
                }
            }
            return path;
        }, [
            arenaSize,
            cellSize,
            edgeLength,
            finderLength,
            qrcode.grid,
            inset_,
            radius,
        ]);
        return _jsx("path", { className: className, d: path, fill: fill });
    }
    Cuer.Cells = Cells;
    (function (Cells) {
        Cells.displayName = 'Cells';
    })(Cells = Cuer.Cells || (Cuer.Cells = {}));
    /**
     * Arena component for the QR code. The arena is the area in the center
     * of the QR code that is not part of the finder pattern.
     *
     * @params {@link Arena.Props}
     * @returns A {@link React.ReactNode}
     */
    function Arena(props) {
        const { children } = props;
        const { arenaSize, cellSize, edgeSize } = React.useContext(Cuer.Context);
        const start = Math.ceil(edgeSize / 2 - arenaSize / 2);
        const size = arenaSize + (arenaSize % 2);
        const padding = cellSize / 2;
        return (_jsx("foreignObject", { x: start, y: start, width: size, height: size, children: _jsx("div", { style: {
                    alignItems: 'center',
                    display: 'flex',
                    fontSize: 1,
                    justifyContent: 'center',
                    height: '100%',
                    overflow: 'hidden',
                    width: '100%',
                    padding,
                    boxSizing: 'border-box',
                }, children: children }) }));
    }
    Cuer.Arena = Arena;
    (function (Arena) {
        Arena.displayName = 'Arena';
    })(Arena = Cuer.Arena || (Cuer.Arena = {}));
})(Cuer || (Cuer = {}));
//# sourceMappingURL=Cuer.js.map