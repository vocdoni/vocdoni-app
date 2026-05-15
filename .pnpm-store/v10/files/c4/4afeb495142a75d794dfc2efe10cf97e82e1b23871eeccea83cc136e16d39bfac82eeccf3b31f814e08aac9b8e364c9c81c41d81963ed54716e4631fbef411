export { isEqualStringList };
function isEqualStringList(a, b) {
    if (a === b)
        return true;
    if (Array.isArray(a) && Array.isArray(b)) {
        const sortedA = [...a].sort();
        const sortedB = [...b].sort();
        return sortedA.length === sortedB.length && sortedA.every((val, i) => val === sortedB[i]);
    }
    return false;
}
