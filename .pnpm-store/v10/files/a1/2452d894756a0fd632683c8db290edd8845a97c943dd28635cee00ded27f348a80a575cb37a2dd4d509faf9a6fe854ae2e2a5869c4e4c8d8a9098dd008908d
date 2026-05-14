export { findPackageJson };
import { findFile } from './findFile.js';
import { createRequire } from 'node:module';
const importMetaUrl = import.meta.url;
const require_ = createRequire(importMetaUrl);
function findPackageJson(cwd) {
    const packageJsonPath = findFile('package.json', cwd);
    if (!packageJsonPath)
        return null;
    const packageJson = require_(packageJsonPath);
    return {
        packageJson,
        packageJsonPath,
    };
}
