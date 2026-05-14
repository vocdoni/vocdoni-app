export { getGlobalObject };
/**
 * Share information across module instances.
 *
 * @__NO_SIDE_EFFECTS__
 */
function getGlobalObject(moduleId, defaultValue) {
    const globals = getGlobals();
    const globalObject = (globals[moduleId] ?? (globals[moduleId] = defaultValue));
    return globalObject;
}
function getGlobals() {
    var _a;
    globalThis._vike ?? (globalThis._vike = {});
    (_a = globalThis._vike).globals ?? (_a.globals = {});
    return globalThis._vike.globals;
}
