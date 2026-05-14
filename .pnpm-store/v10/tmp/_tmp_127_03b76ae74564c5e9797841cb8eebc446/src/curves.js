import { Scalar, buildBn128, buildBls12381} from "ffjavascript";

const bls12381q = Scalar.e("1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaab", 16);
const bn128q = Scalar.e("21888242871839275222246405745257275088696311157297823662689037894645226208583");

export async function getCurveFromQ(q) {
    let curve;
    if (Scalar.eq(q, bn128q)) {
        curve = await buildBn128();
    } else if (Scalar.eq(q, bls12381q)) {
        curve = await buildBls12381();
    } else {
        throw new Error(`Curve not supported: ${Scalar.toString(q)}`);
    }
    return curve;
}