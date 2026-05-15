export { prerender };
import { runPrerenderFromAPI } from '../prerender/runPrerenderEntry.js';
import { prepareViteApiCall } from './prepareViteApiCall.js';
import './assertEnvApiDevAndProd.js';
/**
 * Programmatically trigger `$ vike prerender`
 *
 * https://vike.dev/api#prerender
 */
async function prerender(options = {}) {
    const { viteConfigFromUserResolved } = await prepareViteApiCall(options, 'prerender');
    options.viteConfig = viteConfigFromUserResolved;
    const { viteConfig } = await runPrerenderFromAPI(options);
    return {
        viteConfig,
    };
}
