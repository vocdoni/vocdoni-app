export { getGlobalObject };
import type { VikeGlobalInternal } from '../types/VikeGlobalInternal.js';
type ModuleId = `${string}.ts`;
/**
 * Share information across module instances.
 *
 * @__NO_SIDE_EFFECTS__
 */
declare function getGlobalObject<T extends Record<string, unknown> = never>(moduleId: ModuleId, defaultValue: T): T;
declare global {
    var _vike: VikeGlobalInternal;
}
