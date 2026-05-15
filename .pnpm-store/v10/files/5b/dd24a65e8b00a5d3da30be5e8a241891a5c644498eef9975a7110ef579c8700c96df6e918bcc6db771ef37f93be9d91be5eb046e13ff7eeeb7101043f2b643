import { encodeQR } from 'qr';
export function create(value, options = {}) {
    const { errorCorrection, version } = options;
    const grid = encodeQR(value, 'raw', {
        border: 0,
        ecc: errorCorrection,
        scale: 1,
        version: version,
    });
    const finderLength = 7;
    const edgeLength = grid.length;
    return {
        edgeLength,
        finderLength,
        grid,
        value,
    };
}
//# sourceMappingURL=QrCode.js.map