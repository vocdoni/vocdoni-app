export { useAsync };
import { useId } from 'react';
import { assert, getGlobalObject } from './utils.js';
import { parse } from '@brillout/json-serializer/parse';
import { initDataHtmlClass } from '../shared/initData.js';
import { useSuspense } from '../shared/useSuspense.js';
import { assertKey, stringifyKey } from '../shared/key.js';
const globalObject = getGlobalObject('useAsync.ts', { suspenses: {} });
function useAsync(keyValue, asyncFn) {
    assertKey(keyValue);
    const key = stringifyKey(keyValue);
    const elementId = useId();
    const resolver = async () => {
        const value = await asyncFn();
        return value;
    };
    const resolverSync = () => {
        const initData = getInitData(key, elementId);
        if (initData) {
            const { value } = initData;
            return { value: value };
        }
        return null;
    };
    return useSuspense({
        suspenses: globalObject.suspenses,
        resolver,
        resolverSync,
        key,
        elementId,
        needsWorkaround: true,
        asyncFnName: asyncFn.name,
    });
}
// See provider `provideInitData()`
function getInitData(key, elementId) {
    const elements = Array.from(window.document.querySelectorAll(`.${initDataHtmlClass}`));
    for (const elem of elements) {
        assert(elem.textContent);
        const initData = parse(elem.textContent);
        assert(typeof initData.key === 'string');
        assert(typeof initData.elementId === 'string');
        if (initData.key === key && initData.elementId === elementId) {
            return initData;
        }
    }
    return null;
}
