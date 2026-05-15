export { getFilePathResolved };
export { getFilePathUnresolved };
export { getFilePathAbsoluteUserRootDir };
export { getFilePathToShowToUserUnknown };
export { getFilePathToShowToUserModule };
export { cleanFilePathUnknown };
export { assertModuleId };
import type { FilePathResolved, FilePathUnresolved } from '../../../types/FilePath.js';
import type { ResolvedConfig } from 'vite';
import '../assertEnvVite.js';
declare function getFilePathResolved(args: {
    userRootDir: string;
} & ({
    filePathAbsoluteFilesystem: string;
    importPathAbsolute: string;
} | {
    filePathAbsoluteUserRootDir: string;
    importPathAbsolute?: string;
})): FilePathResolved;
declare function getFilePathUnresolved(args: {
    importPathAbsolute: string;
}): FilePathUnresolved;
declare function getFilePathAbsoluteUserRootDir({ filePathAbsoluteFilesystem, userRootDir, }: {
    filePathAbsoluteFilesystem: string;
    userRootDir: string;
}): string | null;
declare function getFilePathToShowToUserModule(moduleId: string, config: ResolvedConfig): string;
declare function assertModuleId(moduleId: string): void;
declare function getFilePathToShowToUserUnknown(filePathUnknown: string, userRootDir: string): string;
declare function cleanFilePathUnknown(filePathUnknown: string): string;
