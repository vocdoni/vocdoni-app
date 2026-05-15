export { parseImportString };
export { isImportString };
export { serializeImportString };
export type { ImportString };
export type { ImportStringList };
export type { ImportStringParsed };
import '../assertEnvVite.js';
/** `import:${importPath}:${exportName}`
 * @example import:./Layout:default
 */
type ImportString = `import:${string}:${string}`;
type ImportStringList = ImportString | ImportString[];
type ImportStringParsed = {
    importPath: string;
    exportName: string;
};
/**
 * Parse import string in format: import:importPath:exportName
 *
 * @example parseImportString('import:react/jsx-runtime:jsx')
 * // => { importPath: 'react/jsx-runtime', exportName: 'jsx' }
 *
 * @example parseImportString('import:./Layout:default')
 * // => { importPath: './Layout', exportName: 'default' }
 *
 * @example parseImportString('import:./Layout', { legacy: true })
 * // => { importPath: './Layout', exportName: 'default' }
 */
declare function parseImportString(importString: string, { legacy }?: {
    legacy?: boolean;
}): null | ImportStringParsed;
/**
 * Check if a string is an import string (starts with 'import:').
 *
 * @example isImportString('import:react:jsx')
 * // => true
 *
 * @example isImportString('some-other-string')
 * // => false
 */
declare function isImportString(str: string): str is ImportString;
/**
 * Serialize import string from importPath and export name.
 *
 * @example serializeImportString({ importPath: 'react/jsx-runtime', exportName: 'jsx' })
 * // => 'import:react/jsx-runtime:jsx'
 *
 * @example serializeImportString({ importPath: './Layout', exportName: 'default' })
 * // => 'import:./Layout:default'
 */
declare function serializeImportString({ importPath, exportName }: ImportStringParsed): `import:${string}:${string}`;
