export { renderPageServer as renderPage } from './renderPageServer.js';
export { escapeInject, dangerouslySkipEscape } from './renderPageServer/html/renderHtml.js';
export { pipeWebStream, pipeNodeStream, pipeStream, stampPipe } from './renderPageServer/html/stream.js';
export { PROJECT_VERSION as version } from '../../utils/PROJECT_VERSION.js';
export { getGlobalContext, getGlobalContextSync, getGlobalContextAsync } from './globalContext.js';
export { createDevMiddleware } from './createDevMiddleware.js';
export * from '../../types/index-dreprecated.js';
export { injectAssets__public as _injectAssets } from './renderPageServer/html/injectAssets/injectAssets__public.js';
export { createPageRenderer } from '../createPageRenderer.js';
import { RenderErrorPage as RenderErrorPage_ } from '../../shared-server-client/route/abort.js';
import '../assertEnvServer.js';
/** @deprecated
 * Replace:
 *   ```
 *   import { RenderErrorPage } from 'vike'
 *   ```
 * With:
 *   ```
 *   import { render } from 'vike/abort'
 *   ```
 *
 * See https://vike.dev/render
 */
export declare const RenderErrorPage: (...args: Parameters<typeof RenderErrorPage_>) => Error;
