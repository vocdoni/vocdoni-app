export { isImportNpmPackage };
export { isImportNpmPackageOrPathAlias };
export { assertImportIsNpmPackage };
export { isPathAliasRecommendation };
export { getNpmPackageName };
export { parseNpmPackage };
export { isDistinguishable };
declare function getNpmPackageName(str: string): null | string;
declare function isImportNpmPackage(str: string, { cannotBePathAlias }: {
    cannotBePathAlias: true;
}): boolean;
declare function isImportNpmPackageOrPathAlias(str: string): boolean;
declare function assertImportIsNpmPackage(str: string): void;
declare function isPathAliasRecommendation(alias: string): boolean;
declare function isDistinguishable(alias: string): boolean;
declare function parseNpmPackage(str: string | undefined): null | {
    pkgName: string;
    importPath: null | string;
};
