export { resolveReactOptions };
import { isCallable } from '../utils/isCallable.js';
import { objectEntries } from '../utils/objectEntries.js';
function resolveReactOptions(pageContext) {
    const optionsAcc = {};
    (pageContext.config.react ?? []).forEach((valUnresolved) => {
        const optionList = isCallable(valUnresolved) ? valUnresolved(pageContext) : valUnresolved;
        if (!optionList)
            return;
        objectEntries(optionList).forEach(([fnName, options]) => {
            if (!options)
                return;
            optionsAcc[fnName] ?? (optionsAcc[fnName] = {});
            objectEntries(options).forEach(([key, val]) => {
                var _a;
                if (!isCallable(val)) {
                    // @ts-ignore
                    (_a = optionsAcc[fnName])[key] ?? (_a[key] = val);
                }
                else {
                    const valPrevious = optionsAcc[fnName][key];
                    // @ts-ignore
                    optionsAcc[fnName][key] = (...args) => {
                        valPrevious?.(...args);
                        // @ts-ignore
                        val(...args);
                    };
                }
            });
        });
    });
    return optionsAcc;
}
