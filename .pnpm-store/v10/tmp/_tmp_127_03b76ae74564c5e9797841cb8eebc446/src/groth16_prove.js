/*
    Copyright 2018 0KIMS association.

    This file is part of snarkJS.

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

import * as zkeyUtils from "./zkey_utils.js";
import * as wtnsUtils from "./wtns_utils.js";
import { log2 } from "./misc.js";
import { Scalar, utils, BigBuffer } from "ffjavascript";
const {stringifyBigInts} = utils;
import { readBinFile, readSection } from "./binfileutils/binfileutils.js";

export default async function groth16Prove(zkeyFileName, witnessFileName, logger) {
    const {fd: fdWtns, sections: sectionsWtns} = await readBinFile(witnessFileName, "wtns", 2, 1<<25, 1<<23);

    const wtns = await wtnsUtils.readHeader(fdWtns, sectionsWtns);

    const {fd: fdZKey, sections: sectionsZKey} = await readBinFile(zkeyFileName, "zkey", 2, 1<<25, 1<<23);

    const zkey = await zkeyUtils.readHeader(fdZKey, sectionsZKey);

    if (zkey.protocol != "groth16") {
        throw new Error("zkey file is not groth16");
    }

    if (!Scalar.eq(zkey.r,  wtns.q)) {
        throw new Error("Curve of the witness does not match the curve of the proving key");
    }

    if (wtns.nWitness != zkey.nVars) {
        throw new Error(`Invalid witness length. Circuit: ${zkey.nVars}, witness: ${wtns.nWitness}`);
    }

    const curve = zkey.curve;
    const Fr = curve.Fr;
    const G1 = curve.G1;
    const G2 = curve.G2;

    const power = log2(zkey.domainSize);

    if (logger) logger.debug("Reading Wtns");
    const buffWitness = await readSection(fdWtns, sectionsWtns, 2);
    if (logger) logger.debug("Reading Coeffs");
    const buffCoeffs = await readSection(fdZKey, sectionsZKey, 4);

    if (logger) logger.debug("Building ABC");
    const [buffA_T, buffB_T, buffC_T] = await buildABC1(curve, zkey, buffWitness, buffCoeffs, logger);

    const inc = power == Fr.s ? curve.Fr.shift : curve.Fr.w[power+1];

    const buffA = await Fr.ifft(buffA_T, "", "", logger, "IFFT_A");
    const buffAodd = await Fr.batchApplyKey(buffA, Fr.e(1), inc);
    const buffAodd_T = await Fr.fft(buffAodd, "", "", logger, "FFT_A");

    const buffB = await Fr.ifft(buffB_T, "", "", logger, "IFFT_B");
    const buffBodd = await Fr.batchApplyKey(buffB, Fr.e(1), inc);
    const buffBodd_T = await Fr.fft(buffBodd, "", "", logger, "FFT_B");

    const buffC = await Fr.ifft(buffC_T, "", "", logger, "IFFT_C");
    const buffCodd = await Fr.batchApplyKey(buffC, Fr.e(1), inc);
    const buffCodd_T = await Fr.fft(buffCodd, "", "", logger, "FFT_C");

    if (logger) logger.debug("Join ABC");
    const buffPodd_T = await joinABC(curve, zkey, buffAodd_T, buffBodd_T, buffCodd_T, logger);

    let proof = {};

    if (logger) logger.debug("Reading A Points");
    const buffBasesA = await readSection(fdZKey, sectionsZKey, 5);
    proof.pi_a = await curve.G1.multiExpAffine(buffBasesA, buffWitness, logger, "multiexp A");

    if (logger) logger.debug("Reading B1 Points");
    const buffBasesB1 = await readSection(fdZKey, sectionsZKey, 6);
    let pib1 = await curve.G1.multiExpAffine(buffBasesB1, buffWitness, logger, "multiexp B1");

    if (logger) logger.debug("Reading B2 Points");
    const buffBasesB2 = await readSection(fdZKey, sectionsZKey, 7);
    proof.pi_b = await curve.G2.multiExpAffine(buffBasesB2, buffWitness, logger, "multiexp B2");

    if (logger) logger.debug("Reading C Points");
    const buffBasesC = await readSection(fdZKey, sectionsZKey, 8);
    proof.pi_c = await curve.G1.multiExpAffine(buffBasesC, buffWitness.slice((zkey.nPublic+1)*curve.Fr.n8), logger, "multiexp C");

    if (logger) logger.debug("Reading H Points");
    const buffBasesH = await readSection(fdZKey, sectionsZKey, 9);
    const resH = await curve.G1.multiExpAffine(buffBasesH, buffPodd_T, logger, "multiexp H");

    const r = curve.Fr.random();
    const s = curve.Fr.random();

    proof.pi_a  = G1.add( proof.pi_a, zkey.vk_alpha_1 );
    proof.pi_a  = G1.add( proof.pi_a, G1.timesFr( zkey.vk_delta_1, r ));

    proof.pi_b  = G2.add( proof.pi_b, zkey.vk_beta_2 );
    proof.pi_b  = G2.add( proof.pi_b, G2.timesFr( zkey.vk_delta_2, s ));

    pib1 = G1.add( pib1, zkey.vk_beta_1 );
    pib1 = G1.add( pib1, G1.timesFr( zkey.vk_delta_1, s ));

    proof.pi_c = G1.add(proof.pi_c, resH);


    proof.pi_c  = G1.add( proof.pi_c, G1.timesFr( proof.pi_a, s ));
    proof.pi_c  = G1.add( proof.pi_c, G1.timesFr( pib1, r ));
    proof.pi_c  = G1.add( proof.pi_c, G1.timesFr( zkey.vk_delta_1, Fr.neg(Fr.mul(r,s) )));


    let publicSignals = [];

    for (let i=1; i<= zkey.nPublic; i++) {
        const b = buffWitness.slice(i*Fr.n8, i*Fr.n8+Fr.n8);
        publicSignals.push(Scalar.fromRprLE(b));
    }

    proof.pi_a = G1.toObject(G1.toAffine(proof.pi_a));
    proof.pi_b = G2.toObject(G2.toAffine(proof.pi_b));
    proof.pi_c = G1.toObject(G1.toAffine(proof.pi_c));

    proof.protocol = "groth16";
    proof.curve = curve.name;

    await fdZKey.close();
    await fdWtns.close();

    proof = stringifyBigInts(proof);
    publicSignals = stringifyBigInts(publicSignals);

    return {proof, publicSignals};
}


async function buildABC1(curve, zkey, witness, coeffs, logger) {
    const n8 = curve.Fr.n8;
    const sCoef = 4*3 + zkey.n8r;
    const nCoef = (coeffs.byteLength-4) / sCoef;

    const outBuffA = new BigBuffer(zkey.domainSize * n8);
    const outBuffB = new BigBuffer(zkey.domainSize * n8);
    const outBuffC = new BigBuffer(zkey.domainSize * n8);

    const outBuf = [ outBuffA, outBuffB ];
    for (let i=0; i<nCoef; i++) {
        if ((logger)&&(i%1000000 == 0)) logger.debug(`QAP AB: ${i}/${nCoef}`);
        const buffCoef = coeffs.slice(4+i*sCoef, 4+i*sCoef+sCoef);
        const buffCoefV = new DataView(buffCoef.buffer);
        const m= buffCoefV.getUint32(0, true);
        const c= buffCoefV.getUint32(4, true);
        const s= buffCoefV.getUint32(8, true);
        const coef = buffCoef.slice(12, 12+n8);
        outBuf[m].set(
            curve.Fr.add(
                outBuf[m].slice(c*n8, c*n8+n8),
                curve.Fr.mul(coef, witness.slice(s*n8, s*n8+n8))
            ),
            c*n8
        );
    }

    for (let i=0; i<zkey.domainSize; i++) {
        if ((logger)&&(i%1000000 == 0)) logger.debug(`QAP C: ${i}/${zkey.domainSize}`);
        outBuffC.set(
            curve.Fr.mul(
                outBuffA.slice(i*n8, i*n8+n8),
                outBuffB.slice(i*n8, i*n8+n8),
            ),
            i*n8
        );
    }

    return [outBuffA, outBuffB, outBuffC];

}

async function joinABC(curve, zkey, a, b, c, logger) {
    const MAX_CHUNK_SIZE = 1 << 22;

    const n8 = curve.Fr.n8;
    const nElements = Math.floor(a.byteLength / curve.Fr.n8);

    const promises = [];

    for (let i=0; i<nElements; i += MAX_CHUNK_SIZE) {
        if (logger) logger.debug(`JoinABC: ${i}/${nElements}`);
        const n= Math.min(nElements - i, MAX_CHUNK_SIZE);

        const task = [];

        const aChunk = a.slice(i*n8, (i + n)*n8 );
        const bChunk = b.slice(i*n8, (i + n)*n8 );
        const cChunk = c.slice(i*n8, (i + n)*n8 );

        task.push({cmd: "ALLOCSET", var: 0, buff: aChunk});
        task.push({cmd: "ALLOCSET", var: 1, buff: bChunk});
        task.push({cmd: "ALLOCSET", var: 2, buff: cChunk});
        task.push({cmd: "ALLOC", var: 3, len: n*n8});
        task.push({cmd: "CALL", fnName: "qap_joinABC", params:[
            {var: 0},
            {var: 1},
            {var: 2},
            {val: n},
            {var: 3},
        ]});
        task.push({cmd: "CALL", fnName: "frm_batchFromMontgomery", params:[
            {var: 3},
            {val: n},
            {var: 3}
        ]});
        task.push({cmd: "GET", out: 0, var: 3, len: n*n8});
        promises.push(curve.tm.queueAction(task));
    }

    const result = await Promise.all(promises);

    let outBuff;
    if (a instanceof BigBuffer) {
        outBuff = new BigBuffer(a.byteLength);
    } else {
        outBuff = new Uint8Array(a.byteLength);
    }

    let p=0;
    for (let i=0; i<result.length; i++) {
        outBuff.set(result[i][0], p);
        p += result[i][0].byteLength;
    }

    return outBuff;
}

