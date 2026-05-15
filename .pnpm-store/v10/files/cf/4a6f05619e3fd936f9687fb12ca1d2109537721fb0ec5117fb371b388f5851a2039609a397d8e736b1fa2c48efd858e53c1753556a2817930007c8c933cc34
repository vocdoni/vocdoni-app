// TO-DO/breaking-change: remove it
export { clientOnly };
import React, { Suspense, forwardRef, lazy, useEffect, useState, } from 'react';
import { assertWarning } from '../utils/assert.js';
/**
 * Load and render a component only on the client-side.
 *
 * https://vike.dev/clientOnly
 */
function clientOnly(load) {
    assertWarning(false, 'clientOnly() is deprecated — use <ClientOnly> https://vike.dev/ClientOnly');
    if (!globalThis.__VIKE__IS_CLIENT) {
        return (props) => React.createElement(React.Fragment, null, props.fallback);
    }
    else {
        const Component = lazy(() => load()
            .then((LoadedComponent) => ('default' in LoadedComponent ? LoadedComponent : { default: LoadedComponent }))
            .catch((error) => {
            console.error('Component loading failed:', error);
            return { default: (() => React.createElement("p", null, "Error loading component.")) };
        }));
        return forwardRef((props, ref) => {
            const [mounted, setMounted] = useState(false);
            useEffect(() => {
                setMounted(true);
            }, []);
            if (!mounted) {
                return React.createElement(React.Fragment, null, props.fallback);
            }
            const { fallback, ...rest } = props;
            return (React.createElement(Suspense, { fallback: React.createElement(React.Fragment, null, props.fallback) },
                React.createElement(Component, { ...rest, ref: ref })));
        });
    }
}
