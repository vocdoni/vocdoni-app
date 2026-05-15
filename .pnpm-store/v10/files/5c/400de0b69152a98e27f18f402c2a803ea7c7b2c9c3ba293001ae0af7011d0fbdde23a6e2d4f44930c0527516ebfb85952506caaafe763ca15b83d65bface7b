export { createPageContextShared };
export { createPageContextObject };
import { changeEnumerable } from '../utils/changeEnumerable.js';
import { objectAssign } from '../utils/objectAssign.js';
function createPageContextShared(pageContextCreated, globalConfigPublic) {
    objectAssign(pageContextCreated, globalConfigPublic);
    return pageContextCreated;
}
function createPageContextObject() {
    const pageContext = {
        _isOriginalObject: true,
        isPageContext: true,
    };
    changeEnumerable(pageContext, '_isOriginalObject', false);
    return pageContext;
}
