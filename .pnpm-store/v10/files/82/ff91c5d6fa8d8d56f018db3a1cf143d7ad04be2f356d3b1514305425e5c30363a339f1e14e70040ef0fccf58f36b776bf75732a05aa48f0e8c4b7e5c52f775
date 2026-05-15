export { handleErrorWithoutErrorPage };
import type { GlobalContextServerInternal } from '../globalContext.js';
import type { PageContextCreatedServer } from './createPageContextServer.js';
import '../../assertEnvServer.js';
declare function handleErrorWithoutErrorPage<PageContext extends PageContextCreatedServer & {
    errorWhileRendering: null | Error;
    is404: null | boolean;
    pageId: null;
    _globalContext: GlobalContextServerInternal;
    urlOriginal: string;
}>(pageContext: PageContext): PageContext & {
    httpResponse: import("./createHttpResponse.js").HttpResponse;
};
