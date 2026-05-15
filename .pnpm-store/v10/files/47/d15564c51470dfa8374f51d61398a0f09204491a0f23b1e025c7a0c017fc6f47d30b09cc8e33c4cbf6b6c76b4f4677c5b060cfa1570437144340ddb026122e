export { getHttpResponseBody };
export { getHttpResponseBodyStreamHandlers };
import { isStream, getStreamName, inferStreamName, isStreamWritableWeb, isStreamWritableNode, isStreamReadableWeb, isStreamReadableNode, isStreamPipeWeb, isStreamPipeNode, getStreamReadableNode, getStreamReadableWeb, pipeToStreamWritableWeb, pipeToStreamWritableNode, } from './html/stream.js';
import { assert, assertUsage, assertWarning } from '../../../utils/assert.js';
import { getHtmlString } from './html/renderHtml.js';
import pc from '@brillout/picocolors';
import '../../assertEnvServer.js';
const streamDocs = 'See https://vike.dev/streaming for more information.';
function getHttpResponseBody(htmlRender, renderHook) {
    if (typeof htmlRender !== 'string') {
        assertUsage(false, getErrMsg(htmlRender, renderHook, 'body', `Use ${pc.cyan('pageContext.httpResponse.pipe()')} instead`));
    }
    const body = htmlRender;
    return body;
}
function getHttpResponseBodyStreamHandlers(htmlRender, renderHook) {
    return {
        pipe(writable) {
            const getErrMsgMixingStreamTypes = (writableType) => `The ${getErrMsgBody(htmlRender, renderHook)} while a ${writableType} was passed to pageContext.httpResponse.pipe() which is contradictory. You cannot mix a Web Stream with a Node.js Stream.`;
            if (isStreamWritableWeb(writable)) {
                const success = pipeToStreamWritableWeb(htmlRender, writable);
                if (success) {
                    return;
                }
                else {
                    assert(isStreamReadableNode(htmlRender) || isStreamPipeNode(htmlRender));
                    assertUsage(false, getErrMsgMixingStreamTypes('Web Writable'));
                }
            }
            if (isStreamWritableNode(writable)) {
                const success = pipeToStreamWritableNode(htmlRender, writable);
                if (success) {
                    return;
                }
                else {
                    assert(isStreamReadableWeb(htmlRender) || isStreamPipeWeb(htmlRender));
                    assertUsage(false, getErrMsgMixingStreamTypes('Node.js Writable'));
                }
            }
            assertUsage(false, `The argument ${pc.cyan('writable')} passed to ${pc.cyan('pageContext.httpResponse.pipe(writable)')} doesn't seem to be ${getStreamName('writable', 'web')} nor ${getStreamName('writable', 'node')}.`);
        },
        getReadableWebStream() {
            const webStream = getStreamReadableWeb(htmlRender);
            if (webStream === null) {
                assertUsage(false, getErrMsg(htmlRender, renderHook, 'getReadableWebStream()', getFixMsg('readable', 'web')));
            }
            return webStream;
        },
        async getReadableNodeStream() {
            const nodeStream = await getStreamReadableNode(htmlRender);
            if (nodeStream === null) {
                assertUsage(false, getErrMsg(htmlRender, renderHook, 'getReadableNodeStream()', getFixMsg('readable', 'node')));
            }
            return nodeStream;
        },
        async getBody() {
            const body = await getHtmlString(htmlRender);
            return body;
        },
        // TO-DO/next-major-release: remove
        async getNodeStream() {
            assertWarning(false, '`pageContext.httpResponse.getNodeStream()` is outdated, use `pageContext.httpResponse.getReadableNodeStream()` instead. ' +
                streamDocs, { onlyOnce: true, showStackTrace: true });
            const nodeStream = await getStreamReadableNode(htmlRender);
            if (nodeStream === null) {
                assertUsage(false, getErrMsg(htmlRender, renderHook, 'getNodeStream()', getFixMsg('readable', 'node')));
            }
            return nodeStream;
        },
        // TO-DO/next-major-release: remove
        getWebStream() {
            assertWarning(false, '`pageContext.httpResponse.getWebStream(res)` is outdated, use `pageContext.httpResponse.getReadableWebStream(res)` instead. ' +
                streamDocs, { onlyOnce: true, showStackTrace: true });
            const webStream = getStreamReadableWeb(htmlRender);
            if (webStream === null) {
                assertUsage(false, getErrMsg(htmlRender, renderHook, 'getWebStream()', getFixMsg('readable', 'web')));
            }
            return webStream;
        },
        // TO-DO/next-major-release: remove
        pipeToWebWritable(writable) {
            assertWarning(false, '`pageContext.httpResponse.pipeToWebWritable(res)` is outdated, use `pageContext.httpResponse.pipe(res)` instead. ' +
                streamDocs, { onlyOnce: true, showStackTrace: true });
            const success = pipeToStreamWritableWeb(htmlRender, writable);
            if (!success) {
                assertUsage(false, getErrMsg(htmlRender, renderHook, 'pipeToWebWritable()'));
            }
        },
        // TO-DO/next-major-release: remove
        pipeToNodeWritable(writable) {
            assertWarning(false, '`pageContext.httpResponse.pipeToNodeWritable(res)` is outdated, use `pageContext.httpResponse.pipe(res)` instead. ' +
                streamDocs, { onlyOnce: true, showStackTrace: true });
            const success = pipeToStreamWritableNode(htmlRender, writable);
            if (!success) {
                assertUsage(false, getErrMsg(htmlRender, renderHook, 'pipeToNodeWritable()'));
            }
        },
    };
    function getFixMsg(kind, type) {
        const streamName = getStreamName(kind, type);
        assert(['a ', 'an ', 'the '].some((s) => streamName.startsWith(s)));
        assert(renderHook);
        const { hookFilePath, hookName } = renderHook;
        return `Make sure the ${hookName}() hook defined by ${hookFilePath} provides ${streamName} instead`;
    }
}
function getErrMsg(htmlRender, renderHook, method, msgAddendum) {
    assert(!msgAddendum || !msgAddendum.endsWith('.'));
    const errMsgBody = getErrMsgBody(htmlRender, renderHook);
    return [`pageContext.httpResponse.${method} can't be used because the ${errMsgBody}`, msgAddendum, streamDocs]
        .filter(Boolean)
        .join('. ');
}
function getErrMsgBody(htmlRender, renderHook) {
    assert(renderHook);
    const { hookFilePath, hookName } = renderHook;
    const hookReturnType = getHookReturnType(htmlRender);
    assert(['a ', 'an ', 'the '].some((s) => hookReturnType.startsWith(s)));
    const errMsgBody = `${hookName}()\ hook defined by ${hookFilePath} provides ${hookReturnType}`;
    assert(!errMsgBody.endsWith(' '));
    return errMsgBody;
}
function getHookReturnType(htmlRender) {
    if (typeof htmlRender === 'string') {
        return 'an HTML string';
    }
    else if (isStream(htmlRender)) {
        return inferStreamName(htmlRender);
    }
    else {
        assert(false);
    }
}
