export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = {
    [key: string]: JsonValue | undefined;
    [key: symbol]: never | undefined;
};
export type JsonArray = JsonValue[];
export type JsonStructure = JsonArray | JsonObject;
export type JsonValue = JsonPrimitive | JsonStructure;
export type JsonCompatibleObject = {
    [key: string]: JsonCompatible | undefined;
    [key: symbol]: never | undefined;
};
export type JsonCompatibleArray = JsonCompatible[];
export type JsonCompatibleStructure = JsonCompatibleArray | JsonCompatibleObject;
/**
 * A class that can be serialized to JSON.
 */
export type JsonConvertible = {
    toJSON(): JsonCompatible;
};
/**
 * Any value that can be safely serialized to JSON using `JSON.stringify()`.
 */
export type JsonCompatible = JsonPrimitive | JsonConvertible | JsonCompatibleStructure;
