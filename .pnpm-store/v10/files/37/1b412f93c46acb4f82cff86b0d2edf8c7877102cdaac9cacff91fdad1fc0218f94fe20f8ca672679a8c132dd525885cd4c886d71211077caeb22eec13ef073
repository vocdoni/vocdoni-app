export { transformPointerImports };
export { parsePointerImportData };
export { assertPointerImportPath };
export type { PointerImportData };
import '../../assertEnvVite.js';
declare function transformPointerImports(code: string, filePathToShowToUser2: string, pointerImports: Record<string, boolean> | 'all', skipWarnings?: true): string | null;
/**
 * Data Structure for [pointer imports](https://vike.dev/config#pointer-imports):
 *   `import { someExport as someImport } from './some-file'`
 * <=>
 *   `pointerImportData === {`
 *      `importPath: './some-file',`
 *      `exportName: 'someExport',`
 *      `importString: 'import:./some-file:someExport',`
 *      `importStringWasGenerated: true,`
 *    `}`
 * We discard the import name `someImport` because we don't need it.
 */
type PointerImportData = {
    importStringWasGenerated: boolean;
    /** For example: `import:./some-file:someExport` */
    importString: string;
    /** For example: `./some-file` */
    importPath: string;
    /** For example: `someExport` */
    exportName: string;
};
declare function parsePointerImportData(importString: string): null | PointerImportData;
declare function assertPointerImportPath(importPath: string): boolean;
declare module 'estree' {
    interface BaseNodeWithoutComments {
        start: number;
        end: number;
    }
}
