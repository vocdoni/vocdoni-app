export { execHookOnRenderHtml };
export type { RenderHook };
import { type HtmlRender } from './html/renderHtml.js';
import { type HookInternal } from '../../../shared-server-client/hooks/getHook.js';
import type { PageAsset } from './getPageAssets.js';
import type { PageContextSerialization } from './html/serializeContext.js';
import { type PageContextExecHook } from '../../../shared-server-client/hooks/execHook.js';
import type { PageContextConfig } from '../../../shared-server-client/getPageFiles.js';
import type { PageContextInternalServer } from '../../../types/PageContext.js';
import '../../assertEnvServer.js';
type GetPageAssets = () => Promise<PageAsset[]>;
type RenderHook = HookInternal & {
    hookName: HookName;
};
type HookName = 'onRenderHtml' | 'render';
declare function execHookOnRenderHtml(pageContext: PageContextConfig & PageContextExecHook & PageContextInternalServer & PageContextSerialization & {
    pageId: string;
    __getPageAssets: GetPageAssets;
    _isHtmlOnly: boolean;
    _baseServer: string;
    _requestId: number;
}): Promise<{
    renderHook: RenderHook;
    htmlRender: HtmlRender;
}>;
