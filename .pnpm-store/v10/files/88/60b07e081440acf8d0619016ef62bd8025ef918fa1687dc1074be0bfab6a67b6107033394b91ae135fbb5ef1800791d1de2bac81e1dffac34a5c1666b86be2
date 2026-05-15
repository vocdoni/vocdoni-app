export { resolveHeadersResponseEarly };
export { resolveHeadersResponseFinal };
import { PageContextCspNonce } from './csp.js';
import type { PageContextAfterPageEntryLoaded } from './loadPageConfigsLazyServerSide.js';
import '../../assertEnvServer.js';
declare function resolveHeadersResponseFinal(pageContext: {
    headersResponse?: Headers;
}, statusCode: number): [string, string][];
declare function resolveHeadersResponseEarly(pageContext: PageContextAfterPageEntryLoaded & PageContextCspNonce): Promise<{
    headersResponse: Headers;
}>;
