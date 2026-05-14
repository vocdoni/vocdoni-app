export function objectReplace(objOld, objNew, except) {
    Object.keys(objOld)
        .filter((key) => !except?.includes(key))
        .forEach((key) => delete objOld[key]);
    Object.defineProperties(objOld, Object.getOwnPropertyDescriptors(objNew));
}
