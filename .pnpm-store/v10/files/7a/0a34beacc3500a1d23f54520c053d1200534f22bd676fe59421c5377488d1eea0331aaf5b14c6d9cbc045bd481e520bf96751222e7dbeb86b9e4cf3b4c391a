export { pluginReplaceConstantsNonRunnableDev };
import type { Plugin } from 'vite';
import '../../assertEnvVite.js';
declare global {
    var __VIKE__IS_NON_RUNNABLE_DEV: undefined | true;
    var __VIKE__DYNAMIC_IMPORT: (module: `virtual:${string}`) => Promise<Record<string, unknown>>;
}
declare function pluginReplaceConstantsNonRunnableDev(): Plugin[];
