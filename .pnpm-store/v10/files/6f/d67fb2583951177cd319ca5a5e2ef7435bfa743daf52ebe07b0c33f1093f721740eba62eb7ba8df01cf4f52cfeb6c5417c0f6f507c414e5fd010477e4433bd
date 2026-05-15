import { JsonObject, JsonValue } from '@croct/json';
import { JsonValueNode } from './valueNode';
import { JsonNode } from './node';
import { JsonStructureNode, StructureDelimiter } from './structureNode';
import { JsonPropertyNode } from './propertyNode';
import { JsonCompositeDefinition, JsonCompositeNode, PartialJsonCompositeDefinition } from './compositeNode';
import { JsonStringNode } from './primitiveNode';
import { JsonIdentifierNode } from './identifierNode';
export interface JsonObjectDefinition extends JsonCompositeDefinition {
    readonly properties: readonly JsonPropertyNode[];
}
export declare class JsonObjectNode extends JsonStructureNode implements JsonCompositeDefinition {
    private readonly propertyNodes;
    constructor(definition: PartialJsonCompositeDefinition<JsonObjectDefinition>);
    static of(properties: Record<string, JsonValueNode | JsonValue>): JsonObjectNode;
    merge(source: JsonObjectNode): void;
    private insert;
    private findPropertyRange;
    update(other: JsonValueNode | JsonValue): JsonValueNode;
    protected getList(): JsonCompositeNode[];
    protected getDelimiter(): StructureDelimiter;
    protected getMaxDepth(): number;
    has(name: string): boolean;
    get properties(): JsonPropertyNode[];
    set(name: string | JsonStringNode | JsonIdentifierNode, value: JsonValue | JsonValueNode): void;
    delete(name: string): void;
    get(name: string): JsonValueNode;
    get<T extends JsonValueNode>(name: string, type: new (...args: any[]) => T): T;
    clone(): JsonObjectNode;
    isEquivalent(other: JsonNode): boolean;
    toJSON(): JsonObject;
}
