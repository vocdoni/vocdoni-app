export { execHook };
export { execHookGlobal };
export { execHookList };
export { execHookSingle };
export { execHookSingleSync };
export { execHookSingleWithReturn };
export { execHookSingleWithoutPageContext };
export { getPageContext_sync };
export { providePageContext };
export { isUserHookError };
export type { PageContextExecHook };
export type { HookPublic };
import type { PageContextClient, PageContextServer } from '../../types/PageContext.js';
import type { HookInternal, HookLoc } from './getHook.js';
import type { PageContextConfig } from '../getPageFiles.js';
import type { HookName, HookNameGlobal } from '../../types/Config.js';
import { type PageContextPublicMinimum } from '../getPageContextPublicShared.js';
import type { GlobalContextPublicMinimum } from '../getGlobalContextPublicShared.js';
type HookWithResult = HookInternal & {
    hookReturn: unknown;
};
type PageContextExecHook = PageContextPublicMinimum;
declare function execHook<PageContext extends PageContextExecHook & PageContextConfig>(hookName: HookName, pageContext: PageContext, getPageContextPublic: (pageContext: PageContext) => PageContext): Promise<HookWithResult[]>;
declare function execHookGlobal(hookName: HookNameGlobal, globalContext: GlobalContextPublicMinimum, getGlobalContextPublic: (globalContext: GlobalContextPublicMinimum) => GlobalContextPublicMinimum): Promise<void>;
declare function execHookList<PageContext extends PageContextExecHook>(hooks: HookInternal[], pageContext: PageContext, getPageContextPublic: (pageContext: PageContext) => PageContext): Promise<HookWithResult[]>;
declare function execHookSingle<PageContext extends PageContextExecHook>(hook: HookInternal, pageContext: PageContext, getPageContextPublic: (pageContext: PageContext) => PageContext): Promise<void>;
declare function execHookSingleWithReturn<PageContext extends PageContextExecHook>(hook: HookInternal, pageContext: PageContext, getPageContextPublic: (pageContext: PageContext) => PageContext): Promise<{
    hookReturn: unknown;
}>;
declare function isUserHookError(err: unknown): false | HookLoc;
declare function execHookSingleWithoutPageContext<HookReturn>(hook: Omit<HookInternal, 'hookFn'>, globalContext: GlobalContextPublicMinimum, hookFnCaller: () => HookReturn): Promise<HookReturn>;
declare function execHookSingleSync<PageContext extends PageContextExecHook>(hook: Omit<HookInternal<PageContext>, 'hookTimeout'>, globalContext: GlobalContextPublicMinimum, pageContext: PageContext | null, getPageContextPublic: (pageContext: PageContext) => PageContext, hookFnCaller?: () => unknown): {
    hookReturn: unknown;
};
type HookPublic = {
    name: HookName;
    filePath: string;
    call: () => void | Promise<void>;
};
declare function getPageContext_sync<PageContext = PageContextClient | PageContextServer>(): null | PageContext;
/**
 * Provide `pageContext` for universal hooks.
 *
 * https://vike.dev/getPageContext
 */
declare function providePageContext(pageContext: null | PageContextClient | PageContextServer): void;
