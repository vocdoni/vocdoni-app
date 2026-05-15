import { Server, ServerOptions as ServerOptions$1 } from "srvx";

//#region src/types.d.ts
interface Store {
  entries: EntryMeta[];
}
interface EntryMeta {
  /**
   * Module identifier for this entry. This can be a filesystem path or a virtual module.
   */
  id: string;
  /**
   * HTTP method(s) to match. When omitted, matches all HTTP methods.
   */
  method?: HttpMethod | HttpMethod[];
  /**
   * Route pattern(s) for this entry.
   *
   * Should be a valid {@link https://github.com/h3js/rou3 | rou3} pattern.
   */
  route: string | string[];
  /**
   * The Vite environment for this entry.
   *
   * @default ssr
   */
  environment?: string;
}
type HttpMethod = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";
type EntryTransformer = (entry: EntryMeta, index: number) => EntryMeta;
interface Fetchable {
  fetch: (request: Request) => Response | Promise<Response>;
}
interface ServerOptions extends Omit<ServerOptions$1, "manual"> {
  onCreate?: (server: Server) => unknown;
  onReady?: (server: Server) => unknown;
}
//#endregion
//#region src/index.d.ts
declare const catchAllEntry: "virtual:ud:catch-all";
/**
 * Add a Fetchable server entry to the store
 */
declare function addEntry(entry: EntryMeta): void;
/**
 * Retrieve all server entries
 */
declare function getAllEntries(): readonly EntryMeta[];
/**
 * @experimental
 */
declare function setEntryTransformer(transformer: EntryTransformer): void;
//#endregion
export { EntryMeta, EntryTransformer, Fetchable, ServerOptions, Store, addEntry, catchAllEntry, getAllEntries, setEntryTransformer };