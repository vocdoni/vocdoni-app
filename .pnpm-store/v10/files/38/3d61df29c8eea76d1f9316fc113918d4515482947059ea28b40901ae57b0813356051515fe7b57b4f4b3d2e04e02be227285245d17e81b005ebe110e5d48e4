import * as React from "react";
type StrictRef<T> = NonNullable<React.Ref<T>>;
type RefCleanup<T> = ReturnType<React.RefCallback<T>>;
export declare function assignRef<T = any>(ref: StrictRef<T>, value: T | null): RefCleanup<T>;
export declare function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T>;
export {};
