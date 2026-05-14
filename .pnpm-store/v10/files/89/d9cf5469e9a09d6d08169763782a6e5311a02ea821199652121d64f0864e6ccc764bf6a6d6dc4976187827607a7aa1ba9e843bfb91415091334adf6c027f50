export { createPageContextShared };
export { createPageContextObject };
export type { PageContextCreated };
import type { GlobalConfigPublic } from './page-configs/resolveVikeConfigPublic.js';
import type { GlobalContextPublicMinimum } from './getGlobalContextPublicShared.js';
type PageContextCreated = {
    _isOriginalObject: true;
    isPageContext: true;
    isClientSide: boolean;
    _globalContext: GlobalContextPublicMinimum;
};
declare function createPageContextShared<T extends Record<string, unknown>>(pageContextCreated: T, globalConfigPublic: GlobalConfigPublic): T & GlobalConfigPublic;
declare function createPageContextObject(): {
    _isOriginalObject: true;
    isPageContext: true;
};
