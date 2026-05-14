import * as memFile from "./memfile.js";

export async function fastFileReadExisting(o, b, c) {
    if (o instanceof Uint8Array) {
        o = {
            type: "mem",
            data: o
        };
    } else if (!o || o.type !== "mem") {
        throw new Error("Invalid FastFile type, should be a Uint8Array");
    }

    return memFile.readExisting(o);
}

export async function fastFileCreateOverride(o, b, c) {
    if (o.type == "mem") {
        return memFile.createNew(o);
    } else {
        throw new Error("Invalid FastFile type: "+o.type);
    }
}
