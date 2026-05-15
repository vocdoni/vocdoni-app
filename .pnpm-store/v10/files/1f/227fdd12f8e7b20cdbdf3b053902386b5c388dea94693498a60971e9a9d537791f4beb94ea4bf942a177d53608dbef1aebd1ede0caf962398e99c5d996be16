import { JsonToken, JsonTokenType } from '../token';
import { JsonNode, JsonNodeDefinition, PartialJsonNodeDefinition } from './node';
export interface JsonTokenDefinition<T extends JsonTokenType = JsonTokenType> extends JsonNodeDefinition, JsonToken<T> {
}
export declare class JsonTokenNode<T extends JsonTokenType = JsonTokenType> extends JsonNode implements JsonTokenDefinition<T> {
    readonly type: T;
    readonly value: string;
    constructor(definition: PartialJsonNodeDefinition<JsonTokenDefinition<T>>);
    isType<K extends JsonTokenType>(type: K): this is JsonTokenNode<K>;
    clone(): JsonTokenNode<T>;
    isEquivalent(other: JsonNode): boolean;
    toString(): string;
}
