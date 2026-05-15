import { JsonValue } from '@croct/json';
import { JsonNode } from './node';
import { JsonValueNode } from './valueNode';
import { JsonCompositeDefinition, PartialJsonCompositeDefinition } from './compositeNode';
import { JsonTokenNode } from './tokenNode';
import { JsonPrimitiveTokenType, JsonPrimitiveValue, JsonTokenType } from '../token';
import { Formatting } from '../formatting';
export interface JsonPrimitiveDefinition<T extends JsonPrimitiveTokenType> extends JsonCompositeDefinition {
    readonly token: JsonTokenNode<T>;
    readonly value: JsonPrimitiveValue<T>;
}
export type JsonStringNode = JsonPrimitiveNode<JsonTokenType.STRING>;
export type JsonNumberNode = JsonPrimitiveNode<JsonTokenType.NUMBER>;
export type JsonBooleanNode = JsonPrimitiveNode<JsonTokenType.BOOLEAN>;
export type JsonNullNode = JsonPrimitiveNode<JsonTokenType.NULL>;
export declare class JsonPrimitiveNode<T extends JsonPrimitiveTokenType = JsonPrimitiveTokenType> extends JsonValueNode implements JsonPrimitiveDefinition<T> {
    readonly token: JsonTokenNode<T>;
    readonly value: JsonPrimitiveValue<T>;
    constructor(definition: PartialJsonCompositeDefinition<JsonPrimitiveDefinition<T>>);
    static of(value: string): JsonStringNode;
    static of(value: number): JsonNumberNode;
    static of(value: boolean): JsonBooleanNode;
    static of(value: null): JsonNullNode;
    static of(value: JsonPrimitiveNode): JsonPrimitiveNode;
    static ofHex(value: number): JsonNumberNode;
    update(other: JsonValueNode | JsonValue): JsonValueNode;
    reset(): void;
    rebuild(formatting?: Formatting): void;
    clone(): JsonPrimitiveNode<T>;
    isEquivalent(other: JsonNode): boolean;
    toJSON(): JsonPrimitiveValue<T>;
}
