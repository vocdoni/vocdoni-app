export { resolvePageContextCspNone };
export { inferNonceAttr };
export { addCspResponseHeader };
export type { PageContextCspNonce };
import type { PageContextConfig } from '../../../shared-server-client/getPageFiles.js';
import type { PageContextServer } from '../../../types/PageContext.js';
import '../../assertEnvServer.js';
declare function resolvePageContextCspNone(pageContext: PageContextConfig & Partial<PageContextCspNonce>): Promise<null | {
    cspNonce: string | null;
}>;
type PageContextCspNonce = Pick<PageContextServer, 'cspNonce'>;
declare function inferNonceAttr(pageContext: PageContextCspNonce): string;
declare function addCspResponseHeader(pageContext: PageContextCspNonce, headersResponse: Headers): void;
