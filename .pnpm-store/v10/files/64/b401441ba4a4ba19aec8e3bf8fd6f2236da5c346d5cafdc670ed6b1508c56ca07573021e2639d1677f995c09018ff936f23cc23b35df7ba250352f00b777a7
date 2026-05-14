export { isViteServerSide };
import { assert } from './assert.js';
function isViteServerSide(config, viteEnv) {
    if (!viteEnv)
        return !!config?.build?.ssr;
    const { consumer } = viteEnv.config;
    assert(typeof consumer === 'string');
    return consumer !== 'client';
}
