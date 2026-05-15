export { modifyUrlSameOrigin };
export { ModifyUrlSameOriginOptions };
type ModifyUrlSameOriginOptions = {
    hash?: string | null;
    search?: Search | null;
    pathname?: string;
};
type Search = Record<string, string | null | undefined> | URLSearchParams;
declare function modifyUrlSameOrigin(url: string, modify: ModifyUrlSameOriginOptions): string;
