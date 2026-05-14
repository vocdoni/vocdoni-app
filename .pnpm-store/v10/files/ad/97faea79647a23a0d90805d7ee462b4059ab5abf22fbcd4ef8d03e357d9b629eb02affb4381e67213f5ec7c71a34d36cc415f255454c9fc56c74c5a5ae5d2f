export { loadPointerImport };
export { loadValueFile };
export { loadConfigFile };
export type { ConfigFile };
export type { PointerImportLoaded };
import type { FilePathResolved } from '../../../../types/FilePath.js';
import { type EsbuildCache } from './transpileAndExecuteFile.js';
import type { PlusFileValue } from './getPlusFilesByLocationId.js';
import { PointerImport } from './resolvePointerImport.js';
import type { ConfigDefinitionsInternal } from './metaBuiltIn.js';
import '../../assertEnvVite.js';
type ConfigFile = {
    fileExports: Record<string, unknown>;
    filePath: FilePathResolved;
    extendsFilePaths: string[];
};
declare function loadPointerImport(pointerImport: PointerImportLoaded, userRootDir: string, configName: string, configDefinitions: ConfigDefinitionsInternal, esbuildCache: EsbuildCache): Promise<unknown>;
type PointerImportLoaded = PointerImport & ({
    fileExportValueLoaded: true;
    fileExportValue: unknown;
} | {
    fileExportValueLoaded: false;
});
declare function loadValueFile(interfaceValueFile: PlusFileValue, configDefinitions: ConfigDefinitionsInternal, userRootDir: string, esbuildCache: EsbuildCache): Promise<void>;
declare function loadConfigFile(configFilePath: FilePathResolved, userRootDir: string, visited: string[], isExtensionConfig: boolean, esbuildCache: EsbuildCache): Promise<{
    configFile: ConfigFile;
    extendsConfigs: ConfigFile[];
}>;
