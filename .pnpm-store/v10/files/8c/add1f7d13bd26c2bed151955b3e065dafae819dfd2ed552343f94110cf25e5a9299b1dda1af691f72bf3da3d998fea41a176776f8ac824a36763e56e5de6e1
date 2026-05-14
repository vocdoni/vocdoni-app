export { resolvePointerImport };
export { resolvePointerImportData };
export type { PointerImport };
import type { DefinedAtFilePath } from '../../../../types/PageConfig.js';
import { type PointerImportData } from './pointerImports.js';
import type { FilePath, FilePathResolved } from '../../../../types/FilePath.js';
import '../../assertEnvVite.js';
type PointerImport = {
    fileExportPath: FileExportPath;
};
type FileExportPath = DefinedAtFilePath & Required<Pick<DefinedAtFilePath, 'fileExportName'>>;
declare function resolvePointerImport(configValue: unknown, importerFilePath: FilePathResolved, userRootDir: string, configName: string): null | PointerImport;
declare function resolvePointerImportData(pointerImportData: PointerImportData, importerFilePath: FilePathResolved, userRootDir: string): FilePath;
