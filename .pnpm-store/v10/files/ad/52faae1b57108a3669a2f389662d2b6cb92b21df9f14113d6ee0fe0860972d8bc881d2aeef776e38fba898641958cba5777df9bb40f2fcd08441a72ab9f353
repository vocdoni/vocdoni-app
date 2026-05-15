export { usePageContext };
export { VikeReactProviderPageContext };
import React, { useContext } from 'react';
import { getGlobalObject } from '../utils/getGlobalObject.js';
const globalObject = getGlobalObject('usePageContext.tsx', {
    reactContext: React.createContext(undefined),
});
function VikeReactProviderPageContext({ pageContext, children, }) {
    const { reactContext } = globalObject;
    return React.createElement(reactContext.Provider, { value: pageContext }, children);
}
/**
 * Access `pageContext` from any React component.
 *
 * https://vike.dev/usePageContext
 */
function usePageContext() {
    const { reactContext } = globalObject;
    const pageContext = useContext(reactContext);
    return pageContext;
}
