export { transpileAndExecuteFile };
export { getConfigBuildErrorFormatted };
export { getConfigExecutionErrorIntroMsg };
export { isTemporaryBuildFile };
export type { EsbuildCache };
import type { FilePathResolved } from '../../../../types/FilePath.js';
import '../../assertEnvVite.js';
type FileExports = {
    fileExports: Record<string, unknown>;
};
type EsbuildCache = {
    transpileCache: Record<string, // filePathAbsoluteFilesystem
    Promise<FileExports>>;
    vikeConfigDependencies: Set<string>;
};
declare function transpileAndExecuteFile(filePath: FilePathResolved, userRootDir: string, isExtensionConfig: boolean, esbuildCache: EsbuildCache): Promise<FileExports>;
declare function getConfigBuildErrorFormatted(err: unknown): `Failed to transpile ${string} because:
${string}` | null;
declare function getConfigExecutionErrorIntroMsg(err: unknown): `Failed to execute ${string} because:` | null;
declare function isTemporaryBuildFile(filePath: string): boolean;
