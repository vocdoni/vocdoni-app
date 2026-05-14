export { getHookFromPageContext };
export { getHooksFromPageContextNew };
export { getHookFromPageConfig };
export { getHookFromPageConfigGlobal };
export { getHooksFromPageConfigGlobalCumulative };
export { getHook_setIsPrerenderering };
export type { HookInternal };
export type { HookLoc };
export type { HookTimeout };
export type { HooksTimeoutProvidedByUser };
export { getHookTimeoutDefault };
import type { PageContextConfig } from '../getPageFiles.js';
import type { HookNameOld, HookNamePage, HookNameGlobal, HookName } from '../../types/Config.js';
import type { PageConfigGlobalRuntime, PageConfigRuntime } from '../../types/PageConfig.js';
import type { GlobalContextPublicMinimum } from '../getGlobalContextPublicShared.js';
import type { PageContextPublicMinimum } from '../getPageContextPublicShared.js';
type HookArgDefault = PageContextPublicMinimum;
type HookInternal<HookArg = HookArgDefault> = HookLoc & {
    hookFn: HookFn<HookArg>;
    hookTimeout: HookTimeout;
};
type HookLoc = {
    hookName: HookNameOld;
    hookFilePath: string;
};
type HookFn<HookArg = HookArgDefault> = (arg: HookArg, ...rest: unknown[]) => unknown;
type HookTimeout = {
    error: number | false;
    warning: number | false;
};
type HooksTimeoutProvidedByUser = false | Partial<Record<HookNameOld, false | Partial<HookTimeout>>>;
declare function getHookFromPageContext(pageContext: PageContextConfig, hookName: HookNameOld): null | HookInternal;
declare function getHooksFromPageContextNew(hookName: HookName, pageContext: PageContextConfig): HookInternal[];
declare function getHookFromPageConfig(pageConfig: PageConfigRuntime, hookName: HookNamePage): null | HookInternal;
declare function getHookFromPageConfigGlobal(pageConfigGlobal: PageConfigGlobalRuntime, hookName: HookNameGlobal): null | HookInternal;
declare function getHooksFromPageConfigGlobalCumulative<HookArg = GlobalContextPublicMinimum>(pageConfigGlobal: PageConfigGlobalRuntime, hookName: HookNameGlobal): HookInternal<HookArg>[];
declare function getHookTimeoutDefault(hookName: HookNameOld): HookTimeout;
declare function getHook_setIsPrerenderering(): void;
