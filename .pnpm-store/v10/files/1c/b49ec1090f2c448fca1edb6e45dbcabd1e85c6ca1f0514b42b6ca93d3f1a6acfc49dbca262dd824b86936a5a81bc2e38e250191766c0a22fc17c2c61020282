import { SourceLocation } from '../location';
import { Formatting } from '../formatting';
export interface JsonNodeDefinition {
    readonly location: SourceLocation;
}
export type PartialJsonNodeDefinition<T extends JsonNodeDefinition = JsonNodeDefinition> = Omit<T, keyof JsonNodeDefinition> & Partial<JsonNodeDefinition>;
export declare abstract class JsonNode implements JsonNodeDefinition {
    readonly location: SourceLocation;
    protected constructor(definition: PartialJsonNodeDefinition);
    equals(other: JsonNode): boolean;
    private equalsLocation;
    abstract isEquivalent(other: JsonNode): boolean;
    abstract clone(): JsonNode;
    abstract toString(formatting?: Formatting): string;
}
