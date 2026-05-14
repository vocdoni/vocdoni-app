"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonCompositeNode = void 0;
const node_1 = require("./node");
class JsonCompositeNode extends node_1.JsonNode {
    constructor(definition) {
        super(definition);
        this.children = [...(definition.children ?? [])];
    }
    toString(formatting) {
        const clone = this.clone();
        clone.rebuild(formatting);
        return JsonCompositeNode.flatten(clone).join('');
    }
    reformat(formatting = {}) {
        this.reset();
        this.rebuild(formatting);
    }
    static flatten(node) {
        if (node instanceof JsonCompositeNode) {
            return node.children.flatMap(JsonCompositeNode.flatten);
        }
        return [node];
    }
}
exports.JsonCompositeNode = JsonCompositeNode;
