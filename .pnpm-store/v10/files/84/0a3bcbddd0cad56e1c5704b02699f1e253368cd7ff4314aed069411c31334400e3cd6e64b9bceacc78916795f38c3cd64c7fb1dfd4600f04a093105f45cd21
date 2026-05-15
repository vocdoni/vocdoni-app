export { resolveViteConfigFromUser };
export { isOnlyResolvingUserConfig };
export { getVikeConfigInternalEarly };
export { getViteRoot };
export { assertViteRoot };
export { normalizeViteRoot };
import type { ResolvedConfig, UserConfig } from 'vite';
import './assertEnvApiDevAndProd.js';
declare function resolveViteConfigFromUser(): Promise<{
    viteConfigResolved: ResolvedConfig;
    viteConfigFromUserResolved: UserConfig;
}>;
declare function getVikeConfigInternalEarly(): Promise<import("../vite/shared/resolveVikeConfigInternal.js").VikeConfigInternal>;
declare function isOnlyResolvingUserConfig(): boolean | undefined;
declare function getViteRoot(viteContext: ViteContext): Promise<string>;
type ViteContext = 'build' | 'preview' | 'dev';
declare function normalizeViteRoot(root: string): string;
declare function assertViteRoot(rootResolvedEarly: string, config: ResolvedConfig): void;
