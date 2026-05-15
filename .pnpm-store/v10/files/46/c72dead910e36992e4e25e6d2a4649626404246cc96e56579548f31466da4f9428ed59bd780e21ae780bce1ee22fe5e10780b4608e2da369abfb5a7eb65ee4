export { injectHtmlTagsToString };
export { injectHtmlTagsToStream };
export type { PageContextInjectAssets };
export type { PageContextPromise };
import type { PageAsset } from '../getPageAssets.js';
import type { HtmlPart } from './renderHtml.js';
import { type PreloadFilter } from './injectAssets/getHtmlTags.js';
import type { StreamFromReactStreamingPackage } from './stream/react-streaming.js';
import type { PageContextSerialization } from './serializeContext.js';
import type { GlobalContextServerInternal } from '../../globalContext.js';
import '../../../assertEnvServer.js';
type PageContextInjectAssets = {
    urlPathname: string;
    __getPageAssets: () => Promise<PageAsset[]>;
    pageId: string;
    _isHtmlOnly: boolean;
    _pageContextPromise: PageContextPromise;
    _renderHook: {
        hookFilePath: string;
        hookName: 'onRenderHtml' | 'render';
    };
    _baseServer: string;
    is404: null | boolean;
    _globalContext: GlobalContextServerInternal;
} & PageContextSerialization;
declare function injectHtmlTagsToString(htmlParts: HtmlPart[], pageContext: PageContextInjectAssets & {
    _isStream: false;
}, injectFilter: PreloadFilter): Promise<string>;
declare function injectHtmlTagsToStream(pageContext: PageContextInjectAssets & {
    _isStream: true;
}, streamFromReactStreamingPackage: null | StreamFromReactStreamingPackage, injectFilter: PreloadFilter): {
    injectAtStreamBegin: (htmlPartsBegin: HtmlPart[]) => Promise<string>;
    injectAtStreamAfterFirstChunk: () => null | string;
    injectAtStreamEnd: (htmlPartsEnd: HtmlPart[]) => Promise<string>;
};
type PageContextPromise = null | Promise<unknown> | (() => void | Promise<unknown>);
