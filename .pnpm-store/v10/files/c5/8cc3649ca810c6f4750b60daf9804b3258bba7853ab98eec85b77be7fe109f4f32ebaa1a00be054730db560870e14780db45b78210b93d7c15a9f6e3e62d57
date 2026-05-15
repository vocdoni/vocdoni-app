export { stringify };
export { isJsonSerializerError };
export type { Replacer };
import { type Iterable, type Path } from './utils/addPathToReplacer.js';
type Replacer = (this: Iterable, key: string, value: unknown, serializer: (value: unknown) => string) => {
    replacement: unknown;
    resolved?: boolean;
} | undefined;
declare function stringify(value: unknown, { forbidReactElements, space, valueName, sortObjectKeys, replacer: replacerUserProvided, }?: {
    forbidReactElements?: boolean;
    space?: number;
    valueName?: string;
    sortObjectKeys?: boolean;
    replacer?: Replacer;
}): string;
type ErrAddendum = {
    messageCore: `cannot serialize ${string} because it's a function` | `cannot serialize ${string} because it's a React element`;
    value: unknown;
    path: Path;
    pathString: string;
    subjectName: string;
};
declare function isJsonSerializerError(thing: unknown): thing is Error & ErrAddendum;
