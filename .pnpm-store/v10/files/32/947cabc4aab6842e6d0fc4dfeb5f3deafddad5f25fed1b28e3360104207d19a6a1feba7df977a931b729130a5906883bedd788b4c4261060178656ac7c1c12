export { setPageContextCurrent };
export { getPageContextCurrent };
import { getGlobalObject } from '../../utils/getGlobalObject.js';
import '../assertEnvClient.js';
const globalObject = getGlobalObject('getPageContextCurrent.ts', {
    pageContextCurrent: null,
});
function getPageContextCurrent() {
    const { pageContextCurrent } = globalObject;
    return pageContextCurrent;
}
function setPageContextCurrent(pageContextCurrent) {
    globalObject.pageContextCurrent = pageContextCurrent;
}
