export { hasProp };
export type { ResolveTypeAsString };
type TypeAsString = 'object' | 'string{}' | 'string[]' | 'array' | 'function' | 'number' | 'string' | 'boolean' | 'true' | 'false' | 'null' | 'undefined' | undefined;
type ResolveTypeAsString<Type extends TypeAsString = undefined> = Type extends 'object' ? Record<string, unknown> : Type extends 'string{}' ? Record<string, string> : Type extends 'string[]' ? string[] : Type extends 'array' ? unknown[] : Type extends 'function' ? (...args: any[]) => unknown : Type extends 'number' ? number : Type extends 'string' ? string : Type extends 'boolean' ? boolean : Type extends 'true' ? true : Type extends 'false' ? false : Type extends 'null' ? null : Type extends 'undefined' ? undefined : Type extends undefined ? unknown : never;
declare function hasProp<ObjectType, PropName extends PropertyKey, Type extends TypeAsString = undefined>(obj: ObjectType, prop: PropName, type?: Type): obj is ObjectType & Record<PropName, ResolveTypeAsString<Type>>;
declare function hasProp<ObjectType, PropName extends PropertyKey, Enum>(obj: ObjectType, prop: PropName, type: Enum[]): obj is ObjectType & Record<PropName, Enum>;
