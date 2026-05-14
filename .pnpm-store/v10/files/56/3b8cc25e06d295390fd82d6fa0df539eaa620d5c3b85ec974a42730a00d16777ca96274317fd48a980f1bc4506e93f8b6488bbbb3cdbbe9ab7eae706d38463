import { JsonValue } from '@croct/json';
import { JsonValueNode } from './valueNode';
import { JsonNode } from './node';
import { JsonCompositeDefinition, JsonCompositeNode, PartialJsonCompositeDefinition } from './compositeNode';
import { JsonIdentifierNode } from './identifierNode';
import { JsonStringNode } from './primitiveNode';
import { Formatting } from '../formatting';
export interface JsonPropertyDefinition extends JsonCompositeDefinition {
    readonly key: JsonStringNode | JsonIdentifierNode;
    value: JsonValueNode;
}
export declare class JsonPropertyNode extends JsonCompositeNode implements JsonPropertyDefinition {
    readonly key: JsonStringNode | JsonIdentifierNode;
    value: JsonValueNode;
    constructor(definition: PartialJsonCompositeDefinition<JsonPropertyDefinition>);
    reset(): void;
    set(value: JsonValue | JsonValueNode): void;
    rebuild(formatting?: Formatting): void;
    private formatKey;
    clone(): JsonPropertyNode;
    isEquivalent(other: JsonNode): boolean;
}
