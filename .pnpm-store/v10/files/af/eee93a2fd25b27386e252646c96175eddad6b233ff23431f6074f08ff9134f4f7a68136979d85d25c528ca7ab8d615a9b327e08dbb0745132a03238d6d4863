export { hasVikeServerOrVikePhoton };
import { assert, assertWarning } from '../../../../utils/assert.js';
import pc from '@brillout/picocolors';
import '../../assertEnvVite.js';
function hasVikeServerOrVikePhoton(vikeConfig) {
    const vikeExtensionNames = vikeConfig._extensions.map((plusFile) => {
        assert(plusFile.isConfigFile);
        const { name } = plusFile.fileExportsByConfigName;
        assert(typeof name === 'string');
        return name;
    });
    const vikeServerOrVikePhoton = vikeExtensionNames.includes('vike-server')
        ? 'vike-server'
        : vikeExtensionNames.includes('vike-photon')
            ? 'vike-photon'
            : null;
    if (vikeServerOrVikePhoton) {
        assertWarning(false, `${pc.cyan(vikeServerOrVikePhoton)} is deprecated, see ${pc.underline('https://vike.dev/migration/server')}`, { onlyOnce: true });
        return true;
    }
}
