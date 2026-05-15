/** Change enumerability of an object property. */
export function changeEnumerable(obj, prop, enumerable) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    Object.defineProperty(obj, prop, { ...descriptor, enumerable });
}
