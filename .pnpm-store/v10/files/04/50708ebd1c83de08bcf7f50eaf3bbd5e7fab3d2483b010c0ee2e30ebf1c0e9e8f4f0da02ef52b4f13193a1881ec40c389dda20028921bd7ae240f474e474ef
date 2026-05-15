export { navigate };
export { reload };
import '../assertEnvClient.js';
type Options = {
    keepScrollPosition?: boolean;
    overwriteLastHistoryEntry?: boolean;
    pageContext?: Record<string, unknown>;
};
/** Programmatically navigate to a new page.
 *
 * https://vike.dev/navigate
 *
 * @param url - The URL of the new page.
 * @param keepScrollPosition - Don't scroll to the top of the page, instead keep the current scroll position.
 * @param overwriteLastHistoryEntry - Don't create a new entry in the browser's history, instead let the new URL replace the current URL. (This effectively removes the current URL from the browser history).
 */
declare function navigate(url: string, options?: Options): Promise<void>;
declare function reload(): Promise<void>;
