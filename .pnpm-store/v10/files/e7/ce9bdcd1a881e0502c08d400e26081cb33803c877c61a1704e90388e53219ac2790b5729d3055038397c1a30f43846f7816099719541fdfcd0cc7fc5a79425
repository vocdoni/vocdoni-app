export { pluginUnwrapProdOptions };
import { wrapper } from 'vite-plugin-wrapper';
import { escapeRegex } from '../../../../utils/escapeRegex.js';
import '../../assertEnvVite.js';
function pluginUnwrapProdOptions(serverFilePath) {
    return wrapper({
        resolveId: {
            filter: {
                id: new RegExp(escapeRegex(serverFilePath)),
            },
        },
        // Unwrap all prod.* options
        load(id) {
            return `
import mod from ${JSON.stringify(id)};

export * from ${JSON.stringify(id)};
export default { ...mod, ...mod?.prod };
`;
        },
    });
}
