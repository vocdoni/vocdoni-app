export { useConfig };
import { usePageContext } from '../usePageContext.js';
import { getPageContext } from 'vike/getPageContext';
import { applyHeadSettings } from '../../integration/applyHeadSettings.js';
function useConfig() {
    // Vike hook
    let pageContext = getPageContext({ asyncHook: false });
    if (pageContext)
        return (config) => setPageContextConfigViaHook(config, pageContext);
    // Component
    pageContext = usePageContext();
    return (config) => {
        if (!('_headAlreadySet' in pageContext)) {
            setPageContextConfigViaHook(config, pageContext);
        }
        else {
            applyHead(config);
        }
    };
}
function setPageContextConfigViaHook(config, pageContext) {
    pageContext._configViaHook ?? (pageContext._configViaHook = {});
    Object.assign(pageContext._configViaHook, config);
}
function applyHead(config) {
    const { title, lang } = config;
    applyHeadSettings(title, lang);
}
