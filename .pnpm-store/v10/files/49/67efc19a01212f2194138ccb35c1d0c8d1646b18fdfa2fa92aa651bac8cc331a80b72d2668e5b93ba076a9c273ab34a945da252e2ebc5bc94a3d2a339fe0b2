export { navigate, reload } from './navigate.js';
export { prefetch } from './prefetch.js';
export { getPageContextClient } from './renderPageClient.js';
export { PROJECT_VERSION as version } from '../../utils/PROJECT_VERSION.js';
import type { PageContextBuiltInClientWithClientRouting } from '../../types/PageContext.js';
import '../assertEnvClient.js';
/** @deprecated
 * Replace:
 *   ```
 *   import type { PageContextBuiltInClient } from 'vite-plugin/client/router'
 *   ```
 * With:
 *   ```
 *   import type {
 *     PageContextBuiltInClientWithClientRouting as
 *     PageContextBuiltInClient
 *   } from 'vike/types'
 *   ```
 */
type PageContextBuiltInClient<Page = any> = PageContextBuiltInClientWithClientRouting<Page>;
export type { PageContextBuiltInClient };
