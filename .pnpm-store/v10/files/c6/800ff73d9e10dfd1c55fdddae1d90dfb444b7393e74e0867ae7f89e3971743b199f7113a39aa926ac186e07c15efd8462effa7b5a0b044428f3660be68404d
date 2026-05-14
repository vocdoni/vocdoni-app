import { JsonPrimitive } from './mutable';
export type ReadonlyJsonObject = {
    readonly [key: string]: ReadonlyJsonValue | undefined;
    readonly [key: symbol]: never | undefined;
};
export type ReadonlyJsonArray = readonly ReadonlyJsonValue[];
export type ReadonlyJsonStructure = ReadonlyJsonArray | ReadonlyJsonObject;
export type ReadonlyJsonValue = JsonPrimitive | ReadonlyJsonStructure;
export type ReadonlyJsonCompatibleObject = {
    readonly [key: string]: ReadonlyJsonCompatible | undefined;
    readonly [key: symbol]: never | undefined;
};
export type ReadonlyJsonCompatibleArray = readonly ReadonlyJsonCompatible[];
export type ReadonlyJsonCompatibleStructure = ReadonlyJsonCompatibleArray | ReadonlyJsonCompatibleObject;
/**
 * A class that can be serialized to JSON.
 */
export type ReadonlyJsonConvertible = {
    toJSON(): ReadonlyJsonCompatible;
};
/**
 * Any value that can be safely serialized to JSON using `JSON.stringify()`.
 */
export type ReadonlyJsonCompatible = JsonPrimitive | ReadonlyJsonConvertible | ReadonlyJsonCompatibleStructure;
