export { getPlusFilesByLocationId };
export type { PlusFileValue };
export type { PlusFile };
export type { PlusFilesByLocationId };
import { type LocationId } from './filesystemRouting.js';
import { type EsbuildCache } from './transpileAndExecuteFile.js';
import { PointerImportLoaded } from './loadFileAtConfigTime.js';
import type { FilePathResolved } from '../../../../types/FilePath.js';
import '../../assertEnvVite.js';
type PlusFile = PlusFileConfig | PlusFileValue;
type PlusFileCommon = {
    locationId: LocationId;
    filePath: FilePathResolved;
};
/** +config.js */
type PlusFileConfig = PlusFileCommon & {
    /** Whether file is `+config.js` or `+{configName}.js` */
    isConfigFile: true;
    fileExportsByConfigName: Record<string, // configName
    unknown>;
    pointerImportsByConfigName: Record<string, // configName
    PointerImportLoaded[]>;
    isExtensionConfig: boolean;
    extendsFilePaths: string[];
    isNotLoaded?: undefined;
};
/** +{configName}.js */
type PlusFileValue = PlusFileCommon & {
    /** Whether file is `+config.js` or `+{configName}.js` */
    isConfigFile: false;
    configName: string;
} & ({
    isNotLoaded: false;
    fileExportsByConfigName: Record<string, // configName
    unknown>;
} | {
    isNotLoaded: true;
}) & {
    isExtensionConfig?: undefined;
};
type PlusFilesByLocationId = Record<LocationId, PlusFile[]>;
declare function getPlusFilesByLocationId(userRootDir: string, esbuildCache: EsbuildCache): Promise<PlusFilesByLocationId>;
