import type { Issue } from './types/issues.js';
import type { Catalog, Catalogs, PackageJson } from './types/package-json.js';
import type { MainOptions } from './util/create-options.js';
export type CatalogContainer = {
    filePath: string;
    catalog?: Catalog;
    catalogs?: Catalogs;
};
export declare class CatalogCounselor {
    private filePath;
    private entries;
    private referencedEntries;
    private fileContent?;
    constructor(options: MainOptions);
    private addReferencedCatalogEntry;
    addWorkspace(manifest: PackageJson): void;
    settleCatalogIssues(options: MainOptions): Promise<Issue[]>;
}
