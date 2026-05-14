export { useConfig };
import { usePageContext } from '../usePageContext.js';
import { getPageContext } from 'vike/getPageContext';
import { useStreamOptional } from 'react-streaming';
import { objectKeys } from '../../utils/objectKeys.js';
import { includes } from '../../utils/includes.js';
import { assert } from '../../utils/assert.js';
import { configsCumulative } from './configsCumulative.js';
/**
 * Set configurations inside components and Vike hooks.
 *
 * https://vike.dev/useConfig
 */
function useConfig() {
    // Vike hook
    let pageContext = getPageContext({ asyncHook: false });
    if (pageContext)
        return (config) => setPageContextConfigViaHook(config, pageContext);
    // Component
    pageContext = usePageContext();
    assert(!pageContext.isClientSide);
    const stream = useStreamOptional();
    return (config) => {
        if (!pageContext._headAlreadySet) {
            setPageContextConfigViaHook(config, pageContext);
        }
        else {
            assert(stream);
            // <head> already sent to the browser => send DOM-manipulating scripts during HTML streaming
            apply(config, stream, pageContext);
        }
    };
}
const configsClientSide = ['title'];
function setPageContextConfigViaHook(config, pageContext) {
    pageContext._configViaHook ?? (pageContext._configViaHook = {});
    objectKeys(config).forEach((configName) => {
        var _a;
        // Skip HTML only configs which the client-side doesn't need, saving KBs sent to the client as well as avoiding serialization errors.
        if (pageContext.isClientSideNavigation && !configsClientSide.includes(configName))
            return;
        if (!includes(configsCumulative, configName)) {
            // Overridable config
            const configValue = config[configName];
            if (configValue === undefined)
                return;
            pageContext._configViaHook[configName] = configValue;
        }
        else {
            // Cumulative config
            const configValue = config[configName];
            if (!configValue)
                return;
            (_a = pageContext._configViaHook)[configName] ?? (_a[configName] = []);
            pageContext._configViaHook[configName].push(configValue);
        }
    });
}
function apply(config, stream, pageContext) {
    const { title } = config;
    if (title) {
        // No need to escape the injected HTML — see https://github.com/vikejs/vike/blob/36201ddad5f5b527b244b24d548014ec86c204e4/packages/vike/src/server/runtime/renderPageServer/csp.ts#L45
        const nonceAttr = pageContext.cspNonce ? ` nonce="${pageContext.cspNonce}"` : '';
        const htmlSnippet = `<script${nonceAttr}>document.title = ${JSON.stringify(title)}</script>`;
        stream.injectToStream(htmlSnippet);
    }
}
