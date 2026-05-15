import { JsonValueNode } from './valueNode';
import { JsonTokenNode } from './tokenNode';
import { JsonCompositeNode } from './compositeNode';
import { Formatting } from '../formatting';
export declare enum StructureDelimiter {
    OBJECT = "object",
    ARRAY = "array"
}
export declare namespace StructureDelimiter {
    function isStartToken(token: JsonTokenNode): boolean;
    function isEndToken(token: JsonTokenNode): boolean;
    function getStartToken(delimiter: StructureDelimiter): JsonTokenNode;
    function getEndToken(delimiter: StructureDelimiter): JsonTokenNode;
}
export declare abstract class JsonStructureNode extends JsonValueNode {
    reset(): void;
    abstract clone(): JsonStructureNode;
    rebuild(formatting?: Formatting): void;
    private rebuildChildren;
    protected abstract getList(): JsonCompositeNode[];
    protected abstract getDelimiter(): StructureDelimiter;
    protected abstract getMaxDepth(): number;
    protected detectFormatting(parent?: Formatting): Formatting;
    private indent;
    private getIndentationToken;
    private getNewlineToken;
    private static iterate;
    private static skipComments;
    private static matchesInsertion;
    private static matchesRemoval;
}
