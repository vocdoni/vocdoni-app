export { getPageContextClientSerialized };
export { getPageContextClientSerializedAbort };
export { getGlobalContextClientSerialized };
import { stringify, isJsonSerializerError } from '@brillout/json-serializer/stringify';
import { unique } from '../../../../utils/unique.js';
import { getPropAccessNotation } from '../../../../utils/getPropAccessNotation.js';
import { assert, assertUsage, assertWarning } from '../../../../utils/assert.js';
import { hasProp } from '../../../../utils/hasProp.js';
import { isErrorPage } from '../../../../shared-server-client/error-page.js';
import { addIs404ToPageProps } from '../../../../shared-server-client/addIs404ToPageProps.js';
import pc from '@brillout/picocolors';
import { NOT_SERIALIZABLE } from '../../../../shared-server-client/NOT_SERIALIZABLE.js';
import { pageContextInitIsPassedToClient } from '../../../../shared-server-client/misc/pageContextInitIsPassedToClient.js';
import { isServerSideError } from '../../../../shared-server-client/misc/isServerSideError.js';
import { getPropKeys, getPropVal, setPropVal } from './propKeys.js';
import { assertRouteParams } from '../../../../shared-server-client/route/resolveRouteFunction.js';
import '../../../assertEnvServer.js';
const passToClientBuiltInPageContext = [
    'abortReason',
    '_urlRewrite',
    '_urlRedirect',
    'abortStatusCode',
    '_abortCall',
    /* Not needed on the client-side
    '_abortCaller',
    */
    pageContextInitIsPassedToClient,
    'pageId',
    'routeParams',
    'data', // for data() hook
];
const pageToClientBuiltInPageContextError = ['pageProps', 'is404', isServerSideError];
function getPageContextClientSerialized(pageContext, isHtmlJsonScript) {
    const passToClientPageContext = getPassToClientPageContext(pageContext);
    const res = applyPassToClient(passToClientPageContext, pageContext);
    const pageContextClient = res.objClient;
    const pageContextClientProps = res.objClientProps;
    if (pageContextClientProps.some((prop) => getPropVal(pageContext._pageContextInit, prop))) {
        pageContextClient[pageContextInitIsPassedToClient] = true;
    }
    const pageContextClientSerialized = serializeObject(pageContextClient, passToClientPageContext, 'pageContext', isHtmlJsonScript);
    return pageContextClientSerialized;
}
function getGlobalContextClientSerialized(pageContext, isHtmlJsonScript) {
    const passToClient = pageContext._passToClient;
    const globalContext = pageContext._globalContext;
    const res = applyPassToClient(passToClient, globalContext);
    const globalContextClient = res.objClient;
    const globalContextClientSerialized = serializeObject(globalContextClient, passToClient, 'globalContext', isHtmlJsonScript);
    return globalContextClientSerialized;
}
function serializeObject(obj, passToClient, objName, isHtmlJsonScript) {
    let serialized;
    try {
        serialized = serializeValue(obj, isHtmlJsonScript);
    }
    catch (err) {
        const h = (s) => pc.cyan(s);
        let hasWarned = false;
        const propsNonSerializable = [];
        passToClient.forEach((prop) => {
            const res = getPropVal(obj, prop);
            if (!res)
                return;
            const { value } = res;
            const varName = `${objName}${getPropKeys(prop).map(getPropAccessNotation).join('')}`;
            try {
                serializeValue(value, isHtmlJsonScript, varName);
            }
            catch (err) {
                propsNonSerializable.push(prop);
                // useConfig() wrong usage
                if (prop === '_configFromHook') {
                    let pathString = '';
                    if (isJsonSerializerError(err)) {
                        pathString = err.pathString;
                    }
                    // There used to be a `## Serialization Error` section in the docs but we removed it at:
                    // https://github.com/vikejs/vike/commit/c9da2f577db01bd1c8f72265ff83e78484ddc2c0
                    assertUsage(false, `Cannot serialize config value ${h(pathString)} set by useConfig()`);
                }
                // Non-serializable property set by the user
                let msg = [
                    `${h(varName)} can't be serialized and, therefore, can't be passed to the client side.`,
                    `Make sure ${h(varName)} is serializable, or remove ${h(JSON.stringify(prop))} from ${h('passToClient')}.`,
                ].join(' ');
                if (isJsonSerializerError(err)) {
                    msg = `${msg} Serialization error: ${err.messageCore}.`;
                }
                else {
                    // When a property getter throws an error
                    console.warn('Serialization error:');
                    console.warn(err);
                    msg = `${msg} The serialization failed because of the error printed above.`;
                }
                // We warn (instead of throwing an error) since Vike's client runtime throws an error (with `assertUsage()`) if the user's client code tries to access the property that cannot be serialized
                assertWarning(false, msg, { onlyOnce: false });
                hasWarned = true;
            }
        });
        assert(hasWarned);
        propsNonSerializable.forEach((prop) => {
            obj[getPropKeys(prop)[0]] = NOT_SERIALIZABLE;
        });
        try {
            serialized = serializeValue(obj, isHtmlJsonScript);
        }
        catch (err) {
            assert(false);
        }
    }
    return serialized;
}
function serializeValue(value, isHtmlJsonScript, varName) {
    return stringify(value, {
        forbidReactElements: true,
        valueName: varName,
        // Prevent Google from crawling URLs in JSON:
        // - https://github.com/vikejs/vike/pull/2603
        // - https://github.com/brillout/json-serializer/blob/38edbb9945de4938da1e65d6285ce1dd123a45ef/test/main.spec.ts#L44-L95
        replacer: !isHtmlJsonScript
            ? undefined
            : (_key, value) => {
                if (typeof value === 'string') {
                    return { replacement: value.replaceAll('/', '\\/'), resolved: false };
                }
            },
    });
}
function getPassToClientPageContext(pageContext) {
    assertPageContext(pageContext);
    let passToClient = [...pageContext._passToClient, ...passToClientBuiltInPageContext];
    if (isErrorPage(pageContext.pageId, pageContext._globalContext._pageConfigs)) {
        assert(hasProp(pageContext, 'is404', 'boolean'));
        addIs404ToPageProps(pageContext);
        passToClient.push(...pageToClientBuiltInPageContextError);
    }
    passToClient = unique(passToClient);
    return passToClient;
}
function getPageContextClientSerializedAbort(pageContext, isHtmlJsonScript) {
    assert(pageContext._urlRedirect || pageContext._urlRewrite || pageContext.abortStatusCode);
    assert(pageContext._abortCall);
    assert(pageContext._abortCaller);
    // Not needed on the client-side
    delete pageContext._abortCaller;
    const unknownProps = Object.keys(pageContext).filter((prop) => ![
        // prettier-ignore
        // biome-ignore format:
        '_abortCall',
        /* Not needed on the client-side
        '_abortCaller',
        */
        '_urlRedirect',
        '_urlRewrite',
        'abortStatusCode',
        'abortReason',
        'is404',
        'pageProps',
    ].includes(prop));
    if (!pageContext._isLegacyRenderErrorPage) {
        assert(unknownProps.length === 0);
    }
    else {
        // TO-DO/next-major-release: remove
        assertWarning(unknownProps.length === 0, [
            "The following pageContext values won't be available on the client-side:",
            unknownProps.map((p) => `  pageContext[${JSON.stringify(p)}]`),
            'Use `throw render()` instead of `throw RenderErrorPage()`',
        ].join('\n'), {
            onlyOnce: false,
        });
    }
    return serializeValue(pageContext, isHtmlJsonScript);
}
function applyPassToClient(passToClient, obj) {
    const objClient = {};
    const objClientProps = [];
    passToClient.forEach((prop) => {
        // Get value from pageContext
        const res = getPropVal(obj, prop);
        if (!res)
            return;
        const { value } = res;
        // Set value to pageContextClient
        setPropVal(objClient, prop, value);
        objClientProps.push(prop);
    });
    return { objClient, objClientProps };
}
// Ensure the following client-side assert() don't fail:
// https://github.com/vikejs/vike/blob/a33b6e6319a9a0e34ea78e23c5aa156022e3745c/packages/vike/client/shared/getJsonSerializedInHtml.ts#L15-L16
function assertPageContext(pageContext) {
    assertUsage(hasProp(pageContext, 'pageId', 'string'), `${pc.bold('pageContext.pageId')} should be a ${pc.bold('string')}`);
    assertRouteParams(pageContext, `${pc.bold('pageContext.routeParams')} should`);
}
