export { assert };
export { assertWarning };
function assert(condition) {
    if (condition)
        return;
    throw new Error('[vike-react] You stumbled upon a bug, reach out on GitHub.');
}
function assertWarning(condition, message) {
    if (condition)
        return;
    console.warn(new Error(message));
}
