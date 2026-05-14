export { resolvePrerenderConfigGlobal };
export { resolvePrerenderConfigLocal };
import { VikeConfigInternal } from '../vite/shared/resolveVikeConfigInternal.js';
import type { PageConfigBuildTime } from '../../types/PageConfig.js';
declare function resolvePrerenderConfigGlobal(vikeConfig: Pick<VikeConfigInternal, 'config' | '_pageConfigs' | '_from'>): Promise<{
    partial: boolean;
    noExtraDir: boolean | null;
    parallel: number | boolean;
    disableAutoRun: boolean;
} & {
    defaultLocalValue: boolean;
    isPrerenderingEnabled: boolean;
    isPrerenderingEnabledForAllPages: boolean;
    redirects: boolean;
    keepDistServer: boolean;
}>;
declare function resolvePrerenderConfigLocal(pageConfig: PageConfigBuildTime): Promise<{
    value: boolean;
} | null>;
