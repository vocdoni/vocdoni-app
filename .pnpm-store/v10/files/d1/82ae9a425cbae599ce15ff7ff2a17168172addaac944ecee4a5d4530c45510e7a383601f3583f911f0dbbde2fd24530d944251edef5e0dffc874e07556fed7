export { metaBuiltIn };
export type { ConfigDefinition };
export type { ConfigDefinitions };
export type { ConfigDefinitionsInternal };
export type { ConfigDefinitionInternal };
export type { ConfigEffect };
import type { ConfigEnvInternal, ConfigEnv, DefinedAtFilePath } from '../../../../types/PageConfig.js';
import type { Config, ConfigNameBuiltIn, ConfigNameGlobal } from '../../../../types/Config.js';
import { type ConfigDefinedAt } from '../../../../shared-server-client/page-configs/getConfigDefinedAt.js';
import type { PageConfigBuildTimeBeforeComputed } from '../resolveVikeConfigInternal.js';
import '../../assertEnvVite.js';
/** The meta definition of a config.
 *
 * https://vike.dev/meta
 */
type ConfigDefinition = ConfigDefinition_ | ConfigDefinitionDefinedByPeerDependency;
type ConfigDefinition_ = {
    /** In what environment(s) the config value is loaded.
     *
     * https://vike.dev/meta
     */
    env: ConfigEnv;
    /** Disable config overriding and make config values cumulative instead.
     *
     * @default false
     *
     * https://vike.dev/meta
     */
    cumulative?: boolean;
    /**
     * Function called when the config value is defined.
     *
     * https://vike.dev/meta
     */
    effect?: ConfigEffect;
    /**
     * Load the configuration of *all* pages (regardless of what page is being rendered).
     *
     * WARNING: this might bloat server- and client-side KBs.
     *
     * By default, to save server- and client-side KBs, the configuration of a page is only loaded when rendering that page.
     *
     * @default false
     *
     * https://vike.dev/meta
     */
    eager?: boolean;
    /**
     * Whether the configuration always applies to all pages (no config inheritance).
     *
     * @default false
     *
     * https://vike.dev/extends#inheritance
     */
    global?: boolean | ((value: unknown, moreInfo: {
        isGlobalLocation: boolean;
    }) => boolean);
    /** Whether changes to the configuration should trigger a Vite restart. */
    vite?: boolean;
};
type ConfigDefinitionDefinedByPeerDependency = {
    /**
     * Omit the "unknown config" error without defining the config — useful for optional peer dependencies: for example, vike-server sets +stream.require which is defined by vike-{react,vue,solid} but some users don't use vike-{react,vue,solid}
     */
    isDefinedByPeerDependency: true;
};
/**
 * Function called when the config value is defined.
 *
 * https://vike.dev/meta
 */
type ConfigEffect = (config: {
    /** The config value.
     *
     * https://vike.dev/meta
     */
    configValue: unknown;
    /** Where the config value is defined.
     *
     * https://vike.dev/meta
     */
    configDefinedAt: ConfigDefinedAt;
}) => Config | undefined;
/** For Vike internal use */
type ConfigDefinitionInternal = Omit<ConfigDefinition_, 'env'> & {
    _computed?: (pageConfig: PageConfigBuildTimeBeforeComputed) => unknown;
    _valueIsFilePath?: true;
    _userEffectDefinedAtFilePath?: DefinedAtFilePath;
    env: ConfigEnvInternal;
};
type ConfigDefinitions = Record<string, // configName
ConfigDefinition>;
type ConfigDefinitionsInternal = Record<string, // configName
ConfigDefinitionInternal>;
type ConfigDefinitionsBuiltIn = Record<ConfigNameBuiltIn | ConfigNameGlobal, ConfigDefinitionInternal>;
declare const metaBuiltIn: ConfigDefinitionsBuiltIn;
