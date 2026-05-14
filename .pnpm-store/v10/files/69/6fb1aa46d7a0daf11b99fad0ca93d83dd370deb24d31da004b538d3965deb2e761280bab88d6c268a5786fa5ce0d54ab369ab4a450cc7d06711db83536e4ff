import { JsonArray, JsonValue } from '@croct/json';
import { JsonValueNode } from './valueNode';
import { JsonStructureNode, StructureDelimiter } from './structureNode';
import { JsonCompositeDefinition, JsonCompositeNode, PartialJsonCompositeDefinition } from './compositeNode';
export interface JsonArrayDefinition extends JsonCompositeDefinition {
    readonly elements: readonly JsonValueNode[];
}
export declare class JsonArrayNode extends JsonStructureNode implements JsonArrayDefinition {
    private readonly elementNodes;
    constructor(definition: PartialJsonCompositeDefinition<JsonArrayDefinition>);
    static of(...elements: ReadonlyArray<JsonValue | JsonValueNode>): JsonArrayNode;
    update(other: JsonValueNode | JsonValue): JsonValueNode;
    protected getList(): JsonCompositeNode[];
    protected getDelimiter(): StructureDelimiter;
    protected getMaxDepth(): number;
    get elements(): readonly JsonValueNode[];
    get(index: number): JsonValueNode;
    get<T extends JsonValueNode>(index: number, type: new (...args: any[]) => T): T;
    set(index: number, element: JsonValue | JsonValueNode): void;
    clear(): void;
    delete(index: number): void;
    unshift(...elements: Array<JsonValue | JsonValueNode>): void;
    push(...elements: Array<JsonValue | JsonValueNode>): void;
    shift(): JsonValueNode | undefined;
    pop(): JsonValueNode | undefined;
    splice(start: number, deleteCount: number, ...elements: Array<JsonValue | JsonValueNode>): JsonValueNode[];
    clone(): JsonArrayNode;
    isEquivalent(other: JsonValueNode): boolean;
    toJSON(): JsonArray;
}
