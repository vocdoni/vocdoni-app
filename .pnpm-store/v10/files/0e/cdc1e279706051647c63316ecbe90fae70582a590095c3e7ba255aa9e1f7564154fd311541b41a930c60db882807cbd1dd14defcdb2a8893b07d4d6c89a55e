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

import { Scalar } from "ffjavascript";
import {startWriteSection, writeBigInt, endWriteSection, startReadUniqueSection, readBigInt, endReadSection} from "./binfileutils/binfileutils.js";

export async function writeBin(fd, witnessBin, prime) {
    await startWriteSection(fd, 1);
    const n8 = (Math.floor( (Scalar.bitLength(prime) - 1) / 64) +1)*8;
    await fd.writeULE32(n8);
    await writeBigInt(fd, prime, n8);
    if (witnessBin.byteLength % n8 != 0) {
        throw new Error("Invalid witness length");
    }
    await fd.writeULE32(witnessBin.byteLength / n8);
    await endWriteSection(fd);
    await startWriteSection(fd, 2);
    await fd.write(witnessBin);
    await endWriteSection(fd);
}

export async function readHeader(fd, sections) {
    await startReadUniqueSection(fd, sections, 1);
    const n8 = await fd.readULE32();
    const q = await readBigInt(fd, n8);
    const nWitness = await fd.readULE32();
    await endReadSection(fd);
    return {n8, q, nWitness};
}
