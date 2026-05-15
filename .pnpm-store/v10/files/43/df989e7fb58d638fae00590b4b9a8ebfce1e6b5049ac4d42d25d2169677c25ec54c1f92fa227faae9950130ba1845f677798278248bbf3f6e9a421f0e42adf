export { getHeadSetting };
import { isCallable } from '../utils/isCallable.js';
import { configsCumulative } from '../hooks/useConfig/configsCumulative.js';
import { includes } from '../utils/includes.js';
// We use `any` instead of doing proper validation in order to save KBs sent to the client-side.
function getHeadSetting(configName, pageContext) {
    // Set by useConfig()
    const valFromHook = pageContext._configViaHook?.[configName];
    // Set by +configName.js
    const valFromConfig = pageContext.config[configName];
    const getCallable = (val) => (isCallable(val) ? val(pageContext) : val);
    if (!includes(configsCumulative, configName)) {
        if (valFromHook !== undefined)
            return valFromHook;
        return getCallable(valFromConfig);
    }
    else {
        return [
            //
            ...(valFromConfig ?? []).map(getCallable),
            ...(valFromHook ?? []),
        ];
    }
}
