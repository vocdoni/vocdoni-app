export { getOutDirs };
export { resolveOutDir };
export { getOutDirsAllFromRootNormalized };
export type { OutDirs };
import type { UserConfig, ResolvedConfig } from 'vite';
import { type ViteEnv } from './isViteServerSide.js';
import '../assertEnvVite.js';
type OutDirs = {
    /** Absolute path to `outDir` */
    outDirRoot: string;
    /** Absolute path to `${outDir}/client` */
    outDirClient: string;
    /** Absolute path to `${outDir}/server` */
    outDirServer: string;
};
declare function getOutDirs(configGlobal: ResolvedConfig, viteEnv: ViteEnv | undefined): OutDirs;
/** Appends `client/` or `server/` to `config.build.outDir` */
declare function resolveOutDir(config: UserConfig, isServerSide: boolean): string;
declare function getOutDirsAllFromRootNormalized(outDirRoot: string, root: string): OutDirs;
