export { prependBase };
export { isBaseAssets };
export { normalizeUrlPathname };
export { removeBaseServer };
export { modifyUrlPathname };
export { removeUrlOrigin };
export { setUrlOrigin };
export { getUrlPretty };
declare function prependBase(url: string, baseServer: string): string;
declare function removeBaseServer(url: string, baseServer: string): string;
declare function isBaseAssets(base: string): boolean;
declare function normalizeUrlPathname(urlOriginal: string, trailingSlash: boolean, baseServer: string): string | null;
declare function modifyUrlPathname(url: string, modifier: (urlPathname: string) => string | null): string;
declare function removeUrlOrigin(url: string): {
    urlModified: string;
    origin: string | null;
};
declare function setUrlOrigin(url: string, origin: string | null): false | string;
declare function getUrlPretty(url: string): string;
