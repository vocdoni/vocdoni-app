export { resolveGlobalConfigPublic };
export { resolvePageContextConfig };
export { resolveGlobalContextConfig };
export type { PageContextConfig };
export type { PageConfigPublicWithRoute };
export type { GlobalConfigPublic };
export type { Source };
export type { Sources };
export type { From };
export type { ExportsAll };
export type { ConfigEntries };
import type { FileType } from '../getPageFiles/fileTypes.js';
import type { PageFile } from '../getPageFiles/getPageFileObject.js';
import type { ConfigValues, PageConfigBuildTime, PageConfigGlobalBuildTime, PageConfigGlobalRuntime, PageConfigRuntime, PageConfigRuntimeLoaded } from '../../types/PageConfig.js';
import { type ConfigDefinedAtOptional } from './getConfigDefinedAt.js';
import type { ConfigResolved } from '../../types/Config/ConfigResolved.js';
import type { Route } from '../../types/Config.js';
type ExportsAll = Record<string, {
    exportValue: unknown;
    exportSource: string;
    filePath: string | null;
    /** @deprecated */
    _fileType: FileType | null;
    /** @deprecated */
    _isFromDefaultExport: boolean | null;
    /** @deprecated */
    _filePath: string | null;
}[]>;
/** All the config's values (including overridden ones) and where they come from.
 *
 * https://vike.dev/pageContext
 */
type ConfigEntries = Record<string, {
    configValue: unknown;
    configDefinedAt: ConfigDefinedAtOptional;
    configDefinedByFile: string | null;
}[]>;
type From = {
    configsStandard: Record<string, // configName
    SourceConfigsStandard>;
    configsCumulative: Record<string, // configName
    SourceConfigsCumulative>;
    configsComputed: Record<string, // configName
    SourceConfigsComputed>;
};
type Source = Record<string, // configName
SourceAny>;
type Sources = Record<string, // configName
SourceAny[]>;
type SourceAny = SourceConfigsStandard | SourceConfigsCumulative | SourceConfigsComputed;
type SourceConfigsStandard = {
    type: 'configsStandard';
    value: unknown;
    definedAt: string;
};
type SourceConfigsCumulative = {
    type: 'configsCumulative';
    definedAt: string;
    values: {
        value: unknown;
        definedAt: string;
    }[];
};
type SourceConfigsComputed = {
    type: 'configsComputed';
    definedAt: 'Vike';
    value: unknown;
};
type PageContextConfig = {
    /** The page's configuration values.
     *
     * https://vike.dev/config
     * https://vike.dev/pageContext#config
     */
    config: ConfigResolved;
    source: Source;
    sources: Sources;
    from: From;
    /** The page's configuration, including the configs origin and overridden configs.
     *
     * https://vike.dev/config
     */
    configEntries: ConfigEntries;
    /** Custom Exports/Hooks.
     *
     * https://vike.dev/exports
     */
    exports: Record<string, unknown>;
    /**
     * Same as `pageContext.exports` but cumulative.
     *
     * https://vike.dev/exports
     */
    exportsAll: ExportsAll;
    /** @deprecated */
    pageExports: Record<string, unknown>;
};
type WithRoute = {
    route: Route;
    isErrorPage?: undefined;
} | {
    route?: undefined;
    isErrorPage: true;
};
type PageConfigPublicWithRoute = ConfigPublic & WithRoute;
type ConfigPublic = ReturnType<typeof getPublicCopy>;
declare function getPublicCopy(configInternal: ReturnType<typeof resolveConfigPublic_V1Design>): {
    config: ConfigResolved;
    _source: Source;
    _sources: Sources;
    _from: From;
};
declare function resolvePageContextConfig(pageFiles: PageFile[], // V0.4 design
pageConfig: PageConfigRuntimeLoaded | null, // V1 design
pageConfigGlobal: PageConfigGlobalRuntime): PageContextConfig;
declare function resolveGlobalContextConfig(pageConfigs: PageConfigRuntime[], pageConfigGlobal: PageConfigGlobalRuntime): {
    _globalConfigPublic: {
        pages: {
            [k: string]: PageConfigPublicWithRoute;
        };
        config: ConfigResolved;
        _source: Source;
        _sources: Sources;
        _from: From;
    };
    pages: {
        [k: string]: PageConfigPublicWithRoute;
    };
    config: ConfigResolved;
    _source: Source;
    _sources: Sources;
    _from: From;
};
type GlobalConfigPublic = Omit<ReturnType<typeof resolveGlobalConfigPublic>, '_globalConfigPublic'>;
declare function resolveGlobalConfigPublic<PageConfig extends PageConfigRuntime | PageConfigBuildTime, PageConfigGlobal extends PageConfigGlobalRuntime | PageConfigGlobalBuildTime>(pageConfigs: PageConfig[], pageConfigGlobal: PageConfigGlobal, getConfigValues: (config: PageConfig | PageConfigGlobal, isGlobalConfig?: true) => ConfigValues): {
    _globalConfigPublic: {
        pages: {
            [k: string]: PageConfigPublicWithRoute;
        };
        config: ConfigResolved;
        _source: Source;
        _sources: Sources;
        _from: From;
    };
    pages: {
        [k: string]: PageConfigPublicWithRoute;
    };
    config: ConfigResolved;
    _source: Source;
    _sources: Sources;
    _from: From;
};
declare function resolveConfigPublic_V1Design(pageConfig: {
    configValues: ConfigValues;
}): {
    config: ConfigResolved;
    configEntries: ConfigEntries;
    exportsAll: ExportsAll;
    source: Source;
    sources: Sources;
    from: From;
};
