export declare const RAINBOW_FETCH_ERROR = "rainbowFetchError";
export interface RainbowFetchRequestOpts extends RequestInit {
    params?: ConstructorParameters<typeof URLSearchParams>[0];
    timeout?: number;
}
/**
 * rainbowFetch fetches data and handles response edge cases and error handling.
 */
export declare function rainbowFetch<TData>(url: RequestInfo, opts: RainbowFetchRequestOpts): Promise<{
    data: TData;
    headers: Headers;
    status: number;
}>;
interface RainbowFetchClientOpts extends RainbowFetchRequestOpts {
    baseUrl?: string;
}
export declare class RainbowFetchClient {
    baseUrl: string;
    opts: RainbowFetchRequestOpts;
    constructor(opts?: RainbowFetchClientOpts);
    /**
     * Perform a GET request with the RainbowFetchClient.
     */
    get<TData>(url?: RequestInfo, opts?: RainbowFetchRequestOpts): Promise<{
        data: TData;
        headers: Headers;
        status: number;
    }>;
    /**
     * Perform a DELETE request with the RainbowFetchClient.
     */
    delete(url?: RequestInfo, opts?: RainbowFetchRequestOpts): Promise<{
        data: unknown;
        headers: Headers;
        status: number;
    }>;
    /**
     * Perform a HEAD request with the RainbowFetchClient.
     */
    head(url?: RequestInfo, opts?: RainbowFetchRequestOpts): Promise<{
        data: unknown;
        headers: Headers;
        status: number;
    }>;
    /**
     * Perform a OPTIONS request with the RainbowFetchClient.
     */
    options(url?: RequestInfo, opts?: RainbowFetchRequestOpts): Promise<{
        data: unknown;
        headers: Headers;
        status: number;
    }>;
    /**
     * Perform a POST request with the RainbowFetchClient.
     */
    post<TData>(url?: RequestInfo, body?: any, opts?: RainbowFetchRequestOpts): Promise<{
        data: TData;
        headers: Headers;
        status: number;
    }>;
    /**
     * Perform a PUT request with the RainbowFetchClient.
     */
    put<TData>(url?: RequestInfo, body?: any, opts?: RainbowFetchRequestOpts): Promise<{
        data: TData;
        headers: Headers;
        status: number;
    }>;
    /**
     * Perform a PATCH request with the RainbowFetchClient.
     */
    patch<TData>(url?: RequestInfo, body?: any, opts?: RainbowFetchRequestOpts): Promise<{
        data: TData;
        headers: Headers;
        status: number;
    }>;
}
export {};
