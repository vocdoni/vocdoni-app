export { callCumulativeHooks };
import { providePageContext } from 'vike/getPageContext';
import { isCallable } from './isCallable.js';
async function callCumulativeHooks(values, pageContext) {
    if (!values)
        return [];
    const valuesPromises = values.map((val) => {
        if (isCallable(val)) {
            providePageContext(pageContext);
            // Hook
            return val(pageContext);
        }
        else {
            // Plain value
            return val;
        }
    });
    const valuesResolved = await Promise.all(valuesPromises);
    return valuesResolved;
}
