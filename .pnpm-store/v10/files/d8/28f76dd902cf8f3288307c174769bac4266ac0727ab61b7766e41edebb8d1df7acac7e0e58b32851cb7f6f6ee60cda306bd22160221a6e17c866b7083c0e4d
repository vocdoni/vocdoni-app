import { randomBytes } from 'crypto'
import * as BigInteger from 'bigi'
import { getCurveByName, Point } from 'ecurve'
import { keccak256 } from '@ethersproject/keccak256'

const ecparams = getCurveByName('secp256k1')
const G = ecparams.G
const n = ecparams.n as BigInteger

export { ecparams }
export { BigInteger }
export { Point }

export type UserSecretData = { a: BigInteger, b: BigInteger, f: Point }
export type UnblindedSignature = { s: BigInteger, f: Point }

/**
 * Imports a Point from hex string where X and Y coordinates were encoded as 32
 * & 32 bytes in LittleEndian.
 */
export function pointFromHex(pointHex: string) {
    const xBuff = Buffer.from(pointHex.substr(0, 64), 'hex').reverse().toString('hex')
    const yBuff = Buffer.from(pointHex.substr(64), 'hex').reverse().toString('hex')
    const x = BigInteger.fromHex(xBuff)
    const y = BigInteger.fromHex(yBuff)
    const p = Point.fromAffine(ecparams, x, y)
    return p
}

export function pointToHex(point: Point): string {
    const buffX = point.affineX.toBuffer(32).reverse()
    const buffY = point.affineY.toBuffer(32).reverse()

    return buffX.toString("hex") + buffY.toString("hex")
}

export function signatureFromHex(hexSignature: string): UnblindedSignature {
    if (!hexSignature || hexSignature.length != 192) throw new Error("Invalid hex signature (96 bytes expected)")

    const s = BigInteger.fromBuffer(Buffer.from(hexSignature.substr(0, 64), "hex").reverse())
    const f = pointFromHex(hexSignature.substr(64))
    return { s, f }
}

export function signatureToHex(signature: UnblindedSignature): string {
    if (!signature || !signature.f || !signature.s) throw new Error("The signature is empty")
    const { f, s } = signature

    // hex(swapEndiannes(s) ) + hex(f)
    const flippedHexS = s.toBuffer(32).reverse().toString("hex")
    return flippedHexS + pointToHex(f)
}

export function messageToBigNumber(message: string) {
    const msg = Buffer.from(message, 'utf8')
    return BigInteger.fromBuffer(msg)
}

export function newBigFromString(s: string) {
    let a = new BigInteger(null, null, null)
    a.fromString(s, null)
    return a
}

export function newKeyPair() {
    const sk = random(32)
    return { sk: sk, pk: G.multiply(sk) }
}

export function newRequestParameters() {
    const k = random(32)
    return { k: k, signerR: G.multiply(k) }
}

/**
 * Blinds the message for the signer R.
 * @param {BigInteger} m
 * @param {Point} signerR
 * @returns {struct} {mBlinded: BigInteger, userSecretData: {a: BigInteger, b: BigInteger, f: Point}}
 */
export function blind(m: BigInteger, signerR: Point): { mBlinded: BigInteger, userSecretData: UserSecretData } {
    const u: UserSecretData = { a: BigInteger.ZERO as BigInteger, b: BigInteger.ZERO as BigInteger, f: G }
    u.a = random(32)
    u.b = random(32)

    const aR = signerR.multiply(u.a)
    const bG = G.multiply(u.b)
    u.f = aR.add(bG)

    const rx = u.f.affineX.mod(n)

    const ainv = u.a.modInverse(n as unknown as number)
    const ainvrx = ainv.multiply(rx)

    const mHex = m.toString(16)
    const hHex = keccak256('0x' + evenHex(mHex)).substr(2)
    const h = BigInteger.fromHex(hHex)

    const mBlinded = ainvrx.multiply(h)

    return { mBlinded: mBlinded.mod(n), userSecretData: u }
}

export function blindSign(sk: BigInteger, mBlinded: BigInteger, k: BigInteger): BigInteger {
    let sBlind = sk.multiply(mBlinded)
    sBlind = sBlind.add(k)
    return sBlind.mod(n)
}

/**
 * Unblinds the blinded signature.
 * @param blinded signature
 * @param userSecretData
 * @returns unblinded signature
 */
export function unblind(sBlind: BigInteger, userSecretData: UserSecretData): UnblindedSignature {
    const s = userSecretData.a.multiply(sBlind).add(userSecretData.b)
    return { s: s.mod(n), f: userSecretData.f }
}

export function verify(m: BigInteger, s: UnblindedSignature, q: Point) {
    const sG = G.multiply(s.s)

    const mHex = m.toString(16)
    const hHex = keccak256('0x' + evenHex(mHex)).substr(2)
    const h = BigInteger.fromHex(hHex)

    const rx = s.f.affineX.mod(n)
    const right = s.f.add(
        q.multiply(
            rx.multiply(h)
        )
    )

    if ((sG.affineX.toString() == right.affineX.toString())
        && (sG.affineY.toString() == right.affineY.toString())) {
        return true
    }
    return false
}

// HELPERS

function random(bytes: number) {
    let k: BigInteger
    do {
        k = BigInteger.fromByteArrayUnsigned(randomBytes(bytes)) as unknown as BigInteger
    } while (k.toString() == '0' && k.gcd(n).toString() != '1')
    return k
}

export function evenHex(hexString: string) {
    if ((hexString.length % 2) != 0) {
        hexString = "0" + hexString
    }
    return hexString
}
