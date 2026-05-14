import { JsonTokenType } from './token';
import { JsonNode, JsonTokenNode } from './node';
export type NodeMatcher = (node: JsonNode) => boolean;
export declare class NodeManipulator {
    /**
     * The list of nodes.
     */
    private readonly list;
    /**
     * The current position of the iterator, zero-based.
     */
    private index;
    /**
     * Whether the list is currently in fixing mode.
     *
     * This flag is set to true after mismatches and set to false after matches.
     */
    private fixing;
    constructor(list: JsonNode[]);
    done(): boolean;
    next(): void;
    get position(): number;
    seek(position: number): void;
    previous(): void;
    get current(): JsonNode;
    get nodeList(): JsonNode[];
    matchesPreviousToken(type: JsonTokenType): boolean;
    matches(node: JsonNode): boolean;
    matchesToken(type: JsonTokenType): boolean;
    matchesNext(matcher: NodeMatcher, skipped?: NodeMatcher): boolean;
    findNext(matcher: NodeMatcher, skipper?: NodeMatcher): number;
    token(token: JsonTokenNode, $optional?: boolean): this;
    node(node: JsonNode, $optional?: boolean): this;
    nodes(nodes: JsonNode[], optional?: boolean): this;
    insert(node: JsonNode): this;
    remove(): this;
    dropUntil(matcher: NodeMatcher): boolean;
    end(): this;
    private findMatch;
    private fixSpacing;
    private accommodate;
    private static isReplacement;
}
