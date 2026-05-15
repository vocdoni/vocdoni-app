"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonTokenNode = void 0;
const token_1 = require("../token");
const node_1 = require("./node");
class JsonTokenNode extends node_1.JsonNode {
    constructor(definition) {
        super(definition);
        this.type = definition.type;
        this.value = definition.value;
    }
    isType(type) {
        return token_1.JsonToken.isType(this, type);
    }
    clone() {
        return new JsonTokenNode({
            type: this.type,
            value: this.value,
            location: this.location,
        });
    }
    isEquivalent(other) {
        return other instanceof JsonTokenNode
            && this.type === other.type && this.value === other.value;
    }
    toString() {
        return this.value;
    }
}
exports.JsonTokenNode = JsonTokenNode;
