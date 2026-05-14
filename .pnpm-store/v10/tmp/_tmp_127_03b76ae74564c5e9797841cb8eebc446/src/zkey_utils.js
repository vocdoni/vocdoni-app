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

// Format
// ======
// Header(1)
//      Prover Type 1 Groth
// HeaderGroth(2)
//      n8q
//      q
//      n8r
//      r
//      NVars
//      NPub
//      DomainSize  (multiple of 2
//      alpha1
//      beta1
//      delta1
//      beta2
//      gamma2
//      delta2
// IC(3)
// Coefs(4)
// PointsA(5)
// PointsB1(6)
// PointsB2(7)
// PointsC(8)
// PointsH(9)
// Contributions(10)

import {startReadUniqueSection, endReadSection, readBigInt} from "./binfileutils/binfileutils.js";

import { getCurveFromQ as getCurve } from "./curves.js";
import { log2 } from "./misc.js";

export const GROTH16_PROTOCOL_ID = 1;

async function readG1(fd, curve, toObject) {
    const buff = await fd.read(curve.G1.F.n8*2);
    const res = curve.G1.fromRprLEM(buff, 0);
    return toObject ? curve.G1.toObject(res) : res;
}

async function readG2(fd, curve, toObject) {
    const buff = await fd.read(curve.G2.F.n8*2);
    const res = curve.G2.fromRprLEM(buff, 0);
    return toObject ? curve.G2.toObject(res) : res;
}

export async function readHeader(fd, sections, toObject) {
    // Read Header
    /////////////////////
    await startReadUniqueSection(fd, sections, 1);
    const protocolId = await fd.readULE32();
    await endReadSection(fd);

    if (protocolId !== GROTH16_PROTOCOL_ID) {
        throw new Error("Protocol not supported: ");

    }

    const zkey = {};

    zkey.protocol = "groth16";

    // Read Groth Header
    /////////////////////
    await startReadUniqueSection(fd, sections, 2);
    const n8q = await fd.readULE32();
    zkey.n8q = n8q;
    zkey.q = await readBigInt(fd, n8q);

    const n8r = await fd.readULE32();
    zkey.n8r = n8r;
    zkey.r = await readBigInt(fd, n8r);
    zkey.curve = await getCurve(zkey.q);
    zkey.nVars = await fd.readULE32();
    zkey.nPublic = await fd.readULE32();
    zkey.domainSize = await fd.readULE32();
    zkey.power = log2(zkey.domainSize);
    zkey.vk_alpha_1 = await readG1(fd, zkey.curve, toObject);
    zkey.vk_beta_1 = await readG1(fd, zkey.curve, toObject);
    zkey.vk_beta_2 = await readG2(fd, zkey.curve, toObject);
    zkey.vk_gamma_2 = await readG2(fd, zkey.curve, toObject);
    zkey.vk_delta_1 = await readG1(fd, zkey.curve, toObject);
    zkey.vk_delta_2 = await readG2(fd, zkey.curve, toObject);
    await endReadSection(fd);

    return zkey;
}
