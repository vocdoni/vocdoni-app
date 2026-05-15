export { getAssetsDir };
import { assertUsage } from '../../../utils/assert.js';
import '../assertEnvVite.js';
function getAssetsDir(config) {
    let { assetsDir } = config.build;
    assertUsage(assetsDir, `${assetsDir} cannot be an empty string`);
    assetsDir = assetsDir.split(/\/|\\/).filter(Boolean).join('/');
    return assetsDir;
}
