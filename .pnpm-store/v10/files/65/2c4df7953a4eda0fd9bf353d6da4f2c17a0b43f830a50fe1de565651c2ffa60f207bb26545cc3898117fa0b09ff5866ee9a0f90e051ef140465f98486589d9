export { stringify };
export { isJsonSerializerError };
import { types } from './types.js';
import { isReactElement } from './utils/isReactElement.js';
import { isCallable } from './utils/isCallable.js';
import { isObject } from './utils/isObject.js';
import { addPathToReplacer } from './utils/addPathToReplacer.js';
function stringify(value, { forbidReactElements, space, valueName, sortObjectKeys, replacer: replacerUserProvided, } = {}) {
    // The only error `JSON.stringify()` can throw is `TypeError "cyclic object value"`.
    // - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#exceptions
    // - This means we have total of 3 possible errors while serializing:
    //    - Cyclic references
    //    - Functions
    //    - React elements
    const serializer = (val) => JSON.stringify(val, addPathToReplacer(replacer), space);
    return serializer(value);
    function replacer(key, _valueAfterNativeJsonStringify, path) {
        const valueOriginal = this[key];
        let value = valueOriginal;
        {
            const ret = replacerUserProvided?.call(this, key, valueOriginal, serializer);
            if (ret) {
                value = ret.replacement;
                if (ret.resolved !== false)
                    return value;
            }
        }
        if (forbidReactElements && isReactElement(value)) {
            throw genErr({
                value,
                valueType: 'React element',
                path,
                rootValueName: valueName,
            });
        }
        if (isCallable(value)) {
            const functionName = value.name;
            throw genErr({
                value,
                valueType: 'function',
                path,
                rootValueName: valueName,
                problematicValueName: path.length === 0 ? functionName : undefined,
            });
        }
        for (const { is, serialize } of types.slice().reverse()) {
            if (is(value)) {
                //@ts-ignore
                return serialize(value, serializer);
            }
        }
        if (sortObjectKeys && isObject(value)) {
            const copy = {};
            Object.keys(value)
                .sort()
                .forEach((key) => {
                copy[key] = value[key];
            });
            value = copy;
        }
        return value;
    }
}
function genErr({ value, valueType, path, rootValueName, problematicValueName, }) {
    const subjectName = getSubjectName({ path, rootValueName, problematicValueName });
    const messageCore = `cannot serialize ${subjectName} because it's a ${valueType}`;
    const err = new Error(`[@brillout/json-serializer](https://github.com/brillout/json-serializer) ${messageCore}.`);
    const pathString = getPathString(path, true);
    const errAddendum = {
        [stamp]: true,
        messageCore,
        value,
        path,
        pathString,
        subjectName,
    };
    Object.assign(err, errAddendum);
    return err;
}
const stamp = '_isJsonSerializerError';
function isJsonSerializerError(thing) {
    return isObject(thing) && thing[stamp] === true;
}
function getSubjectName({ path, rootValueName, problematicValueName, }) {
    const pathString = getPathString(path, !rootValueName);
    let subjectName;
    if (!pathString) {
        subjectName = rootValueName || problematicValueName || 'value';
    }
    else {
        if (problematicValueName) {
            subjectName = problematicValueName + ' at ';
        }
        else {
            subjectName = '';
        }
        subjectName = subjectName + (rootValueName || '') + pathString;
    }
    return subjectName;
}
function getPathString(path, canBeFirstKey) {
    const pathString = path
        .map((key, i) => {
        if (typeof key === 'number') {
            return `[${key}]`;
        }
        if (i === 0 && canBeFirstKey && isKeyDotNotationCompatible(key)) {
            return key;
        }
        return getPropAccessNotation(key);
    })
        .join('');
    return pathString;
}
function getPropAccessNotation(key) {
    return typeof key === 'string' && isKeyDotNotationCompatible(key) ? `.${key}` : `[${JSON.stringify(key)}]`;
}
function isKeyDotNotationCompatible(key) {
    return /^[a-z0-9\$_]+$/i.test(key);
}
