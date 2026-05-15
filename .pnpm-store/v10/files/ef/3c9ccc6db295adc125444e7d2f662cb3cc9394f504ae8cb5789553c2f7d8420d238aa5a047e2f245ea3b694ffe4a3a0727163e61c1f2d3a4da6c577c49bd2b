import { JsonNode, JsonNodeDefinition } from './node';
import { Formatting } from '../formatting';
export interface JsonCompositeDefinition extends JsonNodeDefinition {
    readonly children: JsonNode[];
}
export type PartialJsonCompositeDefinition<T extends JsonCompositeDefinition = JsonCompositeDefinition> = Omit<T, keyof JsonCompositeDefinition> & Partial<JsonCompositeDefinition>;
export declare abstract class JsonCompositeNode extends JsonNode {
    readonly children: JsonNode[];
    protected constructor(definition: PartialJsonCompositeDefinition);
    toString(formatting?: Formatting): string;
    abstract clone(): JsonCompositeNode;
    abstract reset(): void;
    reformat(formatting?: Formatting): void;
    abstract rebuild(formatting?: Formatting): void;
    private static flatten;
}
