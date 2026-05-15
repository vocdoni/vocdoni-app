export { getPageElement };
import React, { Suspense, useEffect } from 'react';
import { VikeReactProviderPageContext } from '../hooks/usePageContext.js';
function getPageElement(pageContext) {
    const { Page, config: { Loading }, } = pageContext;
    let page = Page ? React.createElement(Page, null) : null;
    // Wrapping
    const addSuspense = (el) => {
        if (!Loading?.layout)
            return el;
        return React.createElement(Suspense, { fallback: React.createElement(Loading.layout, null) }, page);
    };
    page = addSuspense(page);
    [
        // Inner wrapping
        ...(pageContext.config.Layout || []),
        // Outer wrapping
        ...(pageContext.config.Wrapper || []),
    ].forEach((Wrap) => {
        page = React.createElement(Wrap, null, page);
        page = addSuspense(page);
    });
    page = React.createElement(VikeReactProviderPageContext, { pageContext: pageContext }, page);
    let renderPromiseResolve;
    let renderPromiseReject;
    let renderPromise = new Promise((resolve, reject) => {
        renderPromiseResolve = resolve;
        renderPromiseReject = reject;
    });
    page = (React.createElement(VikeReactProviderRenderPromise, { renderPromiseResolve: renderPromiseResolve }, page));
    if (pageContext.config.reactStrictMode !== false) {
        page = React.createElement(React.StrictMode, null, page);
    }
    return { page, renderPromise, renderPromiseReject };
}
function VikeReactProviderRenderPromise({ children, renderPromiseResolve, }) {
    useEffect(renderPromiseResolve);
    return children;
}
