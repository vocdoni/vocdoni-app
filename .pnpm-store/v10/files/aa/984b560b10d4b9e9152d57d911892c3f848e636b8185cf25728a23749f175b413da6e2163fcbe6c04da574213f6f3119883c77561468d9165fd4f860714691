export { escapeInject };
export { dangerouslySkipEscape };
export { renderDocumentHtml };
export { isDocumentHtml };
export { getHtmlString };
import { escapeHtml } from '../../../../utils/escapeHtml.js';
import { isPromise } from '../../../../utils/isPromise.js';
import { isHtml } from '../../../../utils/isHtml.js';
import { assert, assertUsage, assertWarning } from '../../../../utils/assert.js';
import { checkType } from '../../../../utils/checkType.js';
import { hasProp } from '../../../../utils/hasProp.js';
import { objectAssign } from '../../../../utils/objectAssign.js';
import { injectHtmlTagsToString, injectHtmlTagsToStream } from './injectAssets.js';
import { processStream, isStream, streamToString, } from './stream.js';
import { isStreamFromReactStreamingPackage } from './stream/react-streaming.js';
import pc from '@brillout/picocolors';
import '../../../assertEnvServer.js';
function isDocumentHtml(something) {
    if (isTemplateWrapped(something) || isEscapedString(something) || isStream(something)) {
        checkType(something);
        return true;
    }
    return false;
}
async function renderDocumentHtml(documentHtml, pageContext, onErrorWhileStreaming, injectFilter) {
    if (isEscapedString(documentHtml)) {
        objectAssign(pageContext, { _isStream: false });
        let htmlString = getEscapedString(documentHtml);
        htmlString = await injectHtmlTagsToString([htmlString], pageContext, injectFilter);
        return htmlString;
    }
    if (isStream(documentHtml)) {
        objectAssign(pageContext, { _isStream: true });
        const stream = documentHtml;
        const streamWrapper = await renderHtmlStream(stream, null, pageContext, onErrorWhileStreaming, injectFilter);
        return streamWrapper;
    }
    if (isTemplateWrapped(documentHtml)) {
        const templateContent = documentHtml._template;
        const render = renderTemplate(templateContent, pageContext);
        if (!('htmlStream' in render)) {
            objectAssign(pageContext, { _isStream: false });
            const { htmlPartsAll } = render;
            const htmlString = await injectHtmlTagsToString(htmlPartsAll, pageContext, injectFilter);
            return htmlString;
        }
        else {
            objectAssign(pageContext, { _isStream: true });
            const { htmlStream } = render;
            const streamWrapper = await renderHtmlStream(htmlStream, {
                htmlPartsBegin: render.htmlPartsBegin,
                htmlPartsEnd: render.htmlPartsEnd,
            }, pageContext, onErrorWhileStreaming, injectFilter);
            return streamWrapper;
        }
    }
    checkType(documentHtml);
    assert(false);
}
async function renderHtmlStream(streamOriginal, injectString, pageContext, onErrorWhileStreaming, injectFilter) {
    const processStreamOptions = {
        onErrorWhileStreaming,
        enableEagerStreaming: pageContext.enableEagerStreaming,
    };
    if (injectString) {
        let streamFromReactStreamingPackage = null;
        if (isStreamFromReactStreamingPackage(streamOriginal) && !streamOriginal.disabled) {
            streamFromReactStreamingPackage = streamOriginal;
        }
        const { injectAtStreamBegin, injectAtStreamAfterFirstChunk, injectAtStreamEnd } = injectHtmlTagsToStream(pageContext, streamFromReactStreamingPackage, injectFilter);
        processStreamOptions.injectStringAtBegin = async () => {
            return await injectAtStreamBegin(injectString.htmlPartsBegin);
        };
        processStreamOptions.injectStringAtEnd = async () => {
            return await injectAtStreamEnd(injectString.htmlPartsEnd);
        };
        processStreamOptions.injectStringAfterFirstChunk = () => {
            return injectAtStreamAfterFirstChunk();
        };
    }
    let makeClosableAgain = () => { };
    if (isStreamFromReactStreamingPackage(streamOriginal)) {
        // Make sure Vike injects its HTML fragments, such as `<script id="vike_pageContext" type="application/json">`, before the stream is closed (if React/Vue finishes its stream before the promise below resolves).
        makeClosableAgain = streamOriginal.doNotClose();
    }
    try {
        const streamWrapper = await processStream(streamOriginal, processStreamOptions);
        return streamWrapper;
    }
    finally {
        makeClosableAgain();
    }
}
function isTemplateWrapped(something) {
    return hasProp(something, '_template');
}
function isEscapedString(something) {
    const result = hasProp(something, '_escaped');
    if (result) {
        assert(hasProp(something, '_escaped', 'string'));
        checkType(something);
    }
    return result;
}
function getEscapedString(escapedString) {
    let htmlString;
    assert(hasProp(escapedString, '_escaped'));
    htmlString = escapedString._escaped;
    assert(typeof htmlString === 'string');
    return htmlString;
}
function escapeInject(templateStrings, ...templateVariables) {
    assertUsage(templateStrings.length === templateVariables.length + 1 && templateStrings.every((str) => typeof str === 'string'), `You're using ${pc.cyan('escapeInject')} as a function, but ${pc.cyan('escapeInject')} is a string template tag, see https://vike.dev/escapeInject`, { showStackTrace: true });
    return {
        _template: {
            templateStrings,
            templateVariables: templateVariables,
        },
    };
}
function dangerouslySkipEscape(alreadyEscapedString) {
    return _dangerouslySkipEscape(alreadyEscapedString);
}
function _dangerouslySkipEscape(arg) {
    if (hasProp(arg, '_escaped')) {
        assert(isEscapedString(arg));
        return arg;
    }
    assertUsage(!isPromise(arg), `[dangerouslySkipEscape(${pc.cyan('str')})] Argument ${pc.cyan('str')} is a promise. It should be a string instead (or a stream). Make sure to ${pc.cyan('await str')}.`, { showStackTrace: true });
    if (typeof arg === 'string') {
        return { _escaped: arg };
    }
    assertWarning(false, `[dangerouslySkipEscape(${pc.cyan('str')})] Argument ${pc.cyan('str')} should be a string but we got ${pc.cyan(`typeof str === "${typeof arg}"`)}.`, {
        onlyOnce: false,
        showStackTrace: true,
    });
    return { _escaped: String(arg) };
}
function renderTemplate(templateContent, pageContext) {
    const htmlPartsBegin = [];
    const htmlPartsEnd = [];
    let htmlStream = null;
    const addHtmlPart = (htmlPart) => {
        if (htmlStream === null) {
            htmlPartsBegin.push(htmlPart);
        }
        else {
            htmlPartsEnd.push(htmlPart);
        }
    };
    const setStream = (stream) => {
        const { hookName, hookFilePath } = pageContext._renderHook;
        assertUsage(!htmlStream, `Injecting two streams in ${pc.cyan('escapeInject')} template tag of ${hookName}() hook defined by ${hookFilePath}. Inject only one stream instead.`);
        htmlStream = stream;
    };
    const { templateStrings, templateVariables } = templateContent;
    for (let i = 0; i < templateVariables.length; i++) {
        addHtmlPart(templateStrings[i]);
        let templateVar = templateVariables[i];
        // Process `dangerouslySkipEscape()`
        if (isEscapedString(templateVar)) {
            const htmlString = getEscapedString(templateVar);
            // User used `dangerouslySkipEscape()` so we assume the string to be safe
            addHtmlPart(htmlString);
            continue;
        }
        // Process `escapeInject` fragments
        if (isTemplateWrapped(templateVar)) {
            const templateContentInner = templateVar._template;
            const result = renderTemplate(templateContentInner, pageContext);
            if (!('htmlStream' in result)) {
                result.htmlPartsAll.forEach(addHtmlPart);
            }
            else {
                result.htmlPartsBegin.forEach(addHtmlPart);
                setStream(result.htmlStream);
                result.htmlPartsEnd.forEach(addHtmlPart);
            }
            continue;
        }
        if (isStream(templateVar)) {
            setStream(templateVar);
            continue;
        }
        const getErrMsg = (msg) => {
            const { hookName, hookFilePath } = pageContext._renderHook;
            const nth = (i === 0 && '1st') || (i === 1 && '2nd') || (i === 2 && '3rd') || `${i}-th`;
            return [
                `The ${nth} HTML variable is ${msg}`,
                `The HTML was provided by the ${hookName}() hook at ${hookFilePath}.`,
            ]
                .filter(Boolean)
                .join(' ');
        };
        assertUsage(!isPromise(templateVar), getErrMsg(`a promise, did you forget to ${pc.cyan('await')} the promise?`));
        if (templateVar === undefined || templateVar === null) {
            const msgVal = pc.cyan(String(templateVar));
            const msgEmptyString = pc.cyan("''");
            const msg = `${msgVal} which will be converted to an empty string. Pass the empty string ${msgEmptyString} instead of ${msgVal} to remove this warning.`;
            assertWarning(false, getErrMsg(msg), { onlyOnce: false });
            templateVar = '';
        }
        {
            const varType = typeof templateVar;
            if (varType !== 'string') {
                const msgType = pc.cyan(`typeof htmlVariable === "${varType}"`);
                const msg = `${msgType} but a string or stream (https://vike.dev/streaming) is expected instead.`;
                assertUsage(false, getErrMsg(msg));
            }
        }
        {
            const { _isProduction: isProduction } = pageContext._globalContext;
            if (isHtml(templateVar) &&
                // We don't show this warning in production because it's expected that some users may (un)willingly do some XSS injection: we avoid flooding the production logs.
                !isProduction) {
                const msgVal = pc.cyan(String(templateVar));
                const msg = `${msgVal} which seems to be HTML code. Did you forget to wrap the value with dangerouslySkipEscape()?`;
                assertWarning(false, getErrMsg(msg), { onlyOnce: false });
            }
        }
        // Escape untrusted template variable
        addHtmlPart(escapeHtml(templateVar));
    }
    assert(templateStrings.length === templateVariables.length + 1);
    addHtmlPart(templateStrings[templateStrings.length - 1]);
    if (htmlStream === null) {
        assert(htmlPartsEnd.length === 0);
        return {
            htmlPartsAll: htmlPartsBegin,
        };
    }
    return {
        htmlStream,
        htmlPartsBegin,
        htmlPartsEnd,
    };
}
async function getHtmlString(htmlRender) {
    if (typeof htmlRender === 'string') {
        return htmlRender;
    }
    if (isStream(htmlRender)) {
        return streamToString(htmlRender);
    }
    checkType(htmlRender);
    assert(false);
}
