export { getHtmlTags };
export type { HtmlTag };
export type { PreloadFilter };
export type { InjectFilterEntry };
import type { PageContextInjectAssets } from '../injectAssets.js';
import type { StreamFromReactStreamingPackage } from '../stream/react-streaming.js';
import type { PageAsset } from '../../getPageAssets.js';
import '../../../../assertEnvServer.js';
type PreloadFilter = null | ((assets: InjectFilterEntry[]) => InjectFilterEntry[]);
type PreloadFilterInject = false | 'HTML_BEGIN' | 'HTML_END';
/** Filter what assets vike injects in the HTML.
 *
 * https://vike.dev/injectFilter
 */
type InjectFilterEntry = {
    src: string;
    assetType: null | PageAsset['assetType'];
    mediaType: null | PageAsset['mediaType'];
    /** Whether src is a root in the dependency graph.
     *  - For JavaScript this means whether src is imported by a dynamic import() statement.
     *  - All CSS files have `isEntry: true`
     */
    isEntry: boolean;
    inject: PreloadFilterInject;
};
type Position = 'HTML_BEGIN' | 'HTML_END' | 'HTML_STREAM';
type HtmlTag = {
    htmlTag: string | (() => string);
    position: Position;
};
declare function getHtmlTags(pageContext: {
    _isStream: boolean;
} & PageContextInjectAssets, streamFromReactStreamingPackage: null | StreamFromReactStreamingPackage, injectFilter: PreloadFilter, pageAssets: PageAsset[], viteDevScript: string, isStream: boolean): Promise<HtmlTag[]>;
