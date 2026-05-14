export { injectHtmlTagsToString };
export { injectHtmlTagsToStream };
import { isPromise } from '../../../../utils/isPromise.js';
import { isCallable } from '../../../../utils/isCallable.js';
import { assert } from '../../../../utils/assert.js';
import { assertPageContextProvidedByUser } from '../../../../shared-server-client/assertPageContextProvidedByUser.js';
import { joinHtmlTags, injectHtmlTags, createHtmlHeadIfMissing, injectHtmlTagsUsingStream, } from './injectAssets/injectHtmlTags.js';
import { getHtmlTags } from './injectAssets/getHtmlTags.js';
import { getViteDevScript } from './injectAssets/getViteDevScript.js';
import '../../../assertEnvServer.js';
async function injectHtmlTagsToString(htmlParts, pageContext, injectFilter) {
    const pageAssets = await pageContext.__getPageAssets();
    const viteDevScript = await getViteDevScript(pageContext);
    const htmlTags = await getHtmlTags(pageContext, null, injectFilter, pageAssets, viteDevScript, false);
    let htmlString = htmlPartsToString(htmlParts, pageAssets);
    htmlString = injectToHtmlBegin(htmlString, htmlTags);
    htmlString = injectToHtmlEnd(htmlString, htmlTags);
    assert(htmlTags.filter((snippet) => snippet.position === 'HTML_STREAM').length === 0);
    return htmlString;
}
function injectHtmlTagsToStream(pageContext, streamFromReactStreamingPackage, injectFilter) {
    let htmlTags;
    return {
        injectAtStreamBegin,
        injectAtStreamAfterFirstChunk,
        injectAtStreamEnd,
    };
    async function injectAtStreamBegin(htmlPartsBegin) {
        const pageAssets = await pageContext.__getPageAssets();
        const viteDevScript = await getViteDevScript(pageContext);
        htmlTags = await getHtmlTags(pageContext, streamFromReactStreamingPackage, injectFilter, pageAssets, viteDevScript, true);
        let htmlBegin = htmlPartsToString(htmlPartsBegin, pageAssets);
        htmlBegin = injectToHtmlBegin(htmlBegin, htmlTags);
        if (streamFromReactStreamingPackage) {
            injectHtmlTagsUsingStream(htmlTags, streamFromReactStreamingPackage);
        }
        return htmlBegin;
    }
    // Is it worth it? Should we remove this? https://github.com/vikejs/vike/pull/1740#issuecomment-2230540892
    function injectAtStreamAfterFirstChunk() {
        // React has its own stream injection mechanism, see injectHtmlTagsUsingStream()
        if (streamFromReactStreamingPackage)
            return null;
        assert(htmlTags);
        const tags = htmlTags.filter((h) => h.position === 'HTML_STREAM');
        if (tags.length === 0)
            return null;
        const htmlFragment = joinHtmlTags(tags);
        return htmlFragment;
    }
    async function injectAtStreamEnd(htmlPartsEnd) {
        assert(htmlTags);
        await resolvePageContextPromise(pageContext);
        const pageAssets = await pageContext.__getPageAssets();
        let htmlEnd = htmlPartsToString(htmlPartsEnd, pageAssets);
        htmlEnd = injectToHtmlEnd(htmlEnd, htmlTags);
        return htmlEnd;
    }
}
function injectToHtmlBegin(htmlBegin, htmlTags) {
    // Ensure existence of `<head>`
    htmlBegin = createHtmlHeadIfMissing(htmlBegin);
    htmlBegin = injectHtmlTags(htmlBegin, htmlTags, 'HTML_BEGIN');
    return htmlBegin;
}
function injectToHtmlEnd(htmlEnd, htmlTags) {
    htmlEnd = injectHtmlTags(htmlEnd, htmlTags, 'HTML_END');
    return htmlEnd;
}
async function resolvePageContextPromise(pageContext) {
    const pageContextPromise = pageContext._pageContextPromise;
    if (!pageContextPromise) {
        return;
    }
    let pageContextProvidedByUser;
    if (isCallable(pageContextPromise)) {
        pageContextProvidedByUser = await pageContextPromise();
    }
    else if (isPromise(pageContextPromise)) {
        pageContextProvidedByUser = await pageContextPromise;
    }
    else {
        assert(false);
    }
    assertPageContextProvidedByUser(pageContextProvidedByUser, pageContext._renderHook);
    Object.assign(pageContext, pageContextProvidedByUser);
}
function htmlPartsToString(htmlParts, pageAssets) {
    let htmlString = '';
    htmlParts.forEach((p) => {
        htmlString += typeof p === 'string' ? p : p(pageAssets);
    });
    return htmlString;
}
