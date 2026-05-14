export { isPrerenderAutoRunEnabled };
export { temp_disablePrerenderAutoRun };
export { wasPrerenderRun };
export { setWasPrerenderRun };
import { getGlobalObject } from '../../utils/getGlobalObject.js';
import { resolvePrerenderConfigGlobal } from './resolvePrerenderConfig.js';
const globalObject = getGlobalObject('prerender/context.ts', {});
async function isPrerenderAutoRunEnabled(vikeConfig) {
    const prerenderConfigGlobal = await resolvePrerenderConfigGlobal(vikeConfig);
    return (prerenderConfigGlobal.isPrerenderingEnabled &&
        !(prerenderConfigGlobal || {}).disableAutoRun &&
        !globalObject.isDisabled &&
        vikeConfig.config.disableAutoFullBuild !== 'prerender');
}
// TO-DO/next-major-release: remove
function temp_disablePrerenderAutoRun() {
    globalObject.isDisabled = true;
}
function wasPrerenderRun() {
    return globalObject.wasPrerenderRun || false;
}
function setWasPrerenderRun(trigger) {
    globalObject.wasPrerenderRun = trigger;
}
