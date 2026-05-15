import { JsonValue } from '@croct/json';
import { JsonCompositeNode } from './compositeNode';
export declare abstract class JsonValueNode extends JsonCompositeNode {
    abstract update(other: JsonValueNode | JsonValue): JsonValueNode;
    abstract clone(): JsonValueNode;
    cast<T extends JsonValueNode>(type: new (definition: any) => T): T;
    abstract toJSON(): JsonValue;
}
