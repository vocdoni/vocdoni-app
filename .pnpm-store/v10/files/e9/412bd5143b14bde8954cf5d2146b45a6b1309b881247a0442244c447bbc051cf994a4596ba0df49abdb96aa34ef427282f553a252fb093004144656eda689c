export { setPageContextCurrent };
export { getPageContextCurrent };
import type { PageContextConfig } from '../../shared-server-client/getPageFiles.js';
import '../assertEnvClient.js';
type PageContextCurrent = PageContextConfig & {
    urlPathname: string;
};
declare function getPageContextCurrent(): null | PageContextCurrent;
declare function setPageContextCurrent(pageContextCurrent: PageContextCurrent): void;
