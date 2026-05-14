import { JsonValue } from '@croct/json';
import { JsonNode } from './node';
import { JsonValueNode } from './valueNode';
import { JsonCompositeDefinition, PartialJsonCompositeDefinition } from './compositeNode';
import { JsonTokenNode } from './tokenNode';
import { JsonTokenType } from '../token';
export interface JsonIdentifierDefinition extends JsonCompositeDefinition {
    readonly token: JsonTokenNode<JsonTokenType.IDENTIFIER>;
}
export declare class JsonIdentifierNode extends JsonValueNode implements JsonIdentifierDefinition {
    readonly token: JsonTokenNode<JsonTokenType.IDENTIFIER>;
    constructor(definition: PartialJsonCompositeDefinition<JsonIdentifierDefinition>);
    static of(name: string): JsonIdentifierNode;
    update(other: JsonValueNode | JsonValue): JsonValueNode;
    reset(): void;
    rebuild(): void;
    clone(): JsonIdentifierNode;
    isEquivalent(other: JsonNode): boolean;
    toJSON(): string;
}
