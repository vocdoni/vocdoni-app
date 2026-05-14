export { pluginStripPointerImportAttribute };
import { getMagicString } from '../shared/getMagicString.js';
import '../assertEnvVite.js';
// Match `with { type: 'vike:pointer' }` (with optional whitespace variations)
const runtimeAttrRE = /\bwith\s*\{\s*type\s*:\s*['"]vike:pointer['"]\s*\}/g;
function pluginStripPointerImportAttribute() {
    return [
        {
            name: 'vike:pluginStripPointerImportAttribute',
            transform: {
                filter: {
                    code: {
                        include: 'vike:pointer',
                    },
                },
                handler(code, id) {
                    runtimeAttrRE.lastIndex = 0;
                    if (!runtimeAttrRE.test(code))
                        return;
                    const { magicString, getMagicStringResult } = getMagicString(code, id);
                    runtimeAttrRE.lastIndex = 0;
                    let match;
                    while ((match = runtimeAttrRE.exec(code)) !== null) {
                        magicString.remove(match.index, match.index + match[0].length);
                    }
                    return getMagicStringResult();
                },
            },
        },
    ];
}
