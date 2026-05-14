export { useSuspenseData };
export { ReactStreamingProviderSuspenseData };
import React, { useContext } from 'react';
import { getGlobalObject } from '../utils.js';
const globalObject = getGlobalObject('useSuspenseData.ts', {
    ctxSuspenses: React.createContext(undefined),
});
function ReactStreamingProviderSuspenseData({ children }) {
    const suspenses = {};
    return React.createElement(globalObject.ctxSuspenses.Provider, { value: suspenses }, children);
}
function useSuspenseData() {
    const suspenses = useContext(globalObject.ctxSuspenses);
    return suspenses;
}
